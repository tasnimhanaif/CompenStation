// algorithms.js
// Pure business logic. No Express. No MySQL. Just algorithms.

const TimesheetStatus = Object.freeze({
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  PAID: "PAID",
});

/**
 * Store interface expected by algorithms:
 * store = {
 *   createEmployee({fullName, email, hourlyRate}) -> employee
 *   getEmployeeById(id) -> employee|null
 *   getEmployeeByEmail(email) -> employee|null
 *   listEmployees() -> employee[]
 *
 *   createTimesheet({employeeId, periodStart, periodEnd, hoursWorked, notes}) -> timesheet
 *   getTimesheetById(id) -> timesheet|null
 *   listTimesheetsByEmployee(employeeId) -> timesheet[]
 *   listTimesheetsByStatus(status) -> timesheet[]
 *   updateTimesheet(id, patchObj) -> updatedTimesheet
 *
 *   createPayrollRun({periodStart, periodEnd, executedBy, totalGross}) -> payrollRun
 *   createPayrollLine({payrollRunId, employeeId, timesheetId, grossPay}) -> payrollLine
 *   createPaystub({employeeId, payrollRunId, grossPay}) -> paystub
 * }
 */

/** Utility validation */
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function toDate(x) {
  const d = new Date(x);
  assert(!Number.isNaN(d.getTime()), "Invalid date");
  return d;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

/** =========================
 * EMPLOYEE ALGORITHMS
 * ========================= */

/**
 * Employee Algorithm: Submit Timesheet
 * Inputs: employeeId, periodStart, periodEnd, hoursWorked, notes
 * Output: created timesheet
 */
async function submitTimesheet(store, { employeeId, periodStart, periodEnd, hoursWorked, notes }) {
  assert(employeeId != null, "employeeId required");
  const start = toDate(periodStart);
  const end = toDate(periodEnd);
  const hours = Number(hoursWorked);

  assert(end > start, "periodEnd must be after periodStart");
  assert(hours > 0 && hours <= 120, "hoursWorked out of range");

  const emp = await store.getEmployeeById(employeeId);
  assert(emp, "Employee not found");
  assert(emp.isActive !== false, "Employee inactive");

  // Optional: prevent duplicates for same period
  const existing = (await store.listTimesheetsByEmployee(employeeId)).find(
    (t) => +new Date(t.periodStart) === +start && +new Date(t.periodEnd) === +end
  );
  assert(!existing, "Timesheet already exists for this period");

  const ts = await store.createTimesheet({
    employeeId,
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
    hoursWorked: round2(hours),
    notes: notes || "",
  });

  // Immediately mark as submitted
  const updated = await store.updateTimesheet(ts.id, {
    status: TimesheetStatus.SUBMITTED,
    submittedAt: new Date().toISOString(),
  });

  return updated;
}

/**
 * Employee Algorithm: View Timesheets
 */
async function viewMyTimesheets(store, employeeId) {
  assert(employeeId != null, "employeeId required");
  const emp = await store.getEmployeeById(employeeId);
  assert(emp, "Employee not found");
  return store.listTimesheetsByEmployee(employeeId);
}

/** =========================
 * ADMIN ALGORITHMS
 * ========================= */

/**
 * Admin Algorithm: Add Employee
 */
async function addEmployee(store, { fullName, email, hourlyRate }) {
  assert(fullName, "fullName required");
  assert(email, "email required");
  const rate = Number(hourlyRate);
  assert(rate >= 0, "hourlyRate must be >= 0");

  const existing = await store.getEmployeeByEmail(email);
  assert(!existing, "Employee email already exists");

  return store.createEmployee({
    fullName,
    email,
    hourlyRate: round2(rate),
  });
}

/**
 * Admin Algorithm: Approve Timesheet
 */
async function approveTimesheet(store, { timesheetId, reviewedBy }) {
  assert(timesheetId != null, "timesheetId required");
  const ts = await store.getTimesheetById(timesheetId);
  assert(ts, "Timesheet not found");
  assert(ts.status === TimesheetStatus.SUBMITTED, "Timesheet must be SUBMITTED to approve");

  return store.updateTimesheet(timesheetId, {
    status: TimesheetStatus.APPROVED,
    reviewedAt: new Date().toISOString(),
    reviewedBy: reviewedBy ?? null,
  });
}

/**
 * Admin Algorithm: Reject Timesheet
 */
async function rejectTimesheet(store, { timesheetId, reviewedBy, reason }) {
  assert(timesheetId != null, "timesheetId required");
  const ts = await store.getTimesheetById(timesheetId);
  assert(ts, "Timesheet not found");
  assert(ts.status === TimesheetStatus.SUBMITTED, "Timesheet must be SUBMITTED to reject");

  return store.updateTimesheet(timesheetId, {
    status: TimesheetStatus.REJECTED,
    reviewedAt: new Date().toISOString(),
    reviewedBy: reviewedBy ?? null,
    rejectionReason: reason || "",
  });
}

/**
 * Admin Algorithm: Run Payroll (Hourly employees)
 * Steps:
 * 1) Find APPROVED timesheets for period
 * 2) gross = hoursWorked * hourlyRate
 * 3) Create payrollRun + lines + paystubs
 * 4) Mark timesheets PAID (avoid double pay)
 */
async function runPayroll(store, { periodStart, periodEnd, executedBy }) {
  const start = toDate(periodStart);
  const end = toDate(periodEnd);
  assert(end > start, "Invalid payroll period");

  // Get approved timesheets and filter exactly matching the period for simplicity
  const approved = await store.listTimesheetsByStatus(TimesheetStatus.APPROVED);
  const eligible = approved.filter(
    (t) => +new Date(t.periodStart) === +start && +new Date(t.periodEnd) === +end
  );

  assert(eligible.length > 0, "No approved timesheets found for this period");

  let totalGross = 0;
  const computed = [];

  for (const ts of eligible) {
    const emp = await store.getEmployeeById(ts.employeeId);
    assert(emp, "Employee missing for timesheet");
    const gross = round2(Number(ts.hoursWorked) * Number(emp.hourlyRate));
    totalGross = round2(totalGross + gross);
    computed.push({ ts, emp, gross });
  }

  const payrollRun = await store.createPayrollRun({
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
    executedBy: executedBy ?? null,
    totalGross,
  });

  for (const item of computed) {
    await store.createPayrollLine({
      payrollRunId: payrollRun.id,
      employeeId: item.emp.id,
      timesheetId: item.ts.id,
      grossPay: item.gross,
    });

    await store.createPaystub({
      employeeId: item.emp.id,
      payrollRunId: payrollRun.id,
      grossPay: item.gross,
    });

    await store.updateTimesheet(item.ts.id, { status: TimesheetStatus.PAID, paidAt: new Date().toISOString() });
  }

  return { payrollRun, count: computed.length, totalGross };
}

module.exports = {
  TimesheetStatus,
  submitTimesheet,
  viewMyTimesheets,
  addEmployee,
  approveTimesheet,
  rejectTimesheet,
  runPayroll,
};
