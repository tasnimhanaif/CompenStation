// algorithms.js
// Pure business logic. No Express. No MySQL. Just algorithms.

const TimesheetStatus = Object.freeze({
  DRAFT:     "DRAFT",
  SUBMITTED: "SUBMITTED",
  APPROVED:  "APPROVED",
  REJECTED:  "REJECTED",
  PAID:      "PAID",
});

const VALID_BENEFIT_TYPES = ["MEDICAL","DENTAL","VISION","LIFE_INSURANCE","RETIREMENT_401K","OTHER"];
const VALID_DEDUCTION_TYPES = ["FEDERAL_TAX","STATE_TAX","LOCAL_TAX","SOCIAL_SECURITY","MEDICARE","GARNISHMENT","OTHER"];

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

function toMySQLDate(date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

// ================================================================
// EMPLOYEE ALGORITHMS
// ================================================================

/**
 * Add Employee
 * Required: fullName, email, hourlyRate
 * Optional: phone, address, department, jobTitle
 */
async function addEmployee(store, { fullName, email, hourlyRate, phone, address, department, jobTitle }) {
  assert(fullName && fullName.trim(), "fullName required");
  assert(email && email.trim(), "email required");
  const rate = Number(hourlyRate);
  assert(!isNaN(rate) && rate >= 0, "hourlyRate must be >= 0");

  const existing = await store.getEmployeeByEmail(email.trim().toLowerCase());
  assert(!existing, "An employee with this email already exists");

  return store.createEmployee({
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    hourlyRate: round2(rate),
    phone: phone || null,
    address: address || null,
    department: department || null,
    jobTitle: jobTitle || null,
  });
}

/**
 * Modify Employee personal info and/or hourly rate
 * Only provided fields are updated.
 */
async function modifyEmployee(store, { employeeId, fullName, email, hourlyRate, phone, address, department, jobTitle, isActive }) {
  assert(employeeId != null, "employeeId required");
  const emp = await store.getEmployeeById(employeeId);
  assert(emp, "Employee not found");

  const patch = {};
  if (fullName    !== undefined) patch.fullName    = fullName.trim();
  if (email       !== undefined) {
    const existing = await store.getEmployeeByEmail(email.trim().toLowerCase());
    assert(!existing || existing.id === employeeId, "Email already in use by another employee");
    patch.email = email.trim().toLowerCase();
  }
  if (hourlyRate  !== undefined) {
    const rate = Number(hourlyRate);
    assert(!isNaN(rate) && rate >= 0, "hourlyRate must be >= 0");
    patch.hourlyRate = round2(rate);
  }
  if (phone       !== undefined) patch.phone       = phone;
  if (address     !== undefined) patch.address     = address;
  if (department  !== undefined) patch.department  = department;
  if (jobTitle    !== undefined) patch.jobTitle     = jobTitle;
  if (isActive    !== undefined) patch.isActive     = Boolean(isActive);

  assert(Object.keys(patch).length > 0, "No fields provided to update");
  return store.updateEmployee(employeeId, patch);
}

/**
 * Delete Employee (soft delete: marks isActive = false)
 * Pass hardDelete: true to fully remove the record.
 */
async function deleteEmployee(store, { employeeId, hardDelete = false }) {
  assert(employeeId != null, "employeeId required");
  const emp = await store.getEmployeeById(employeeId);
  assert(emp, "Employee not found");

  if (hardDelete) {
    await store.deleteEmployee(employeeId);
    return { deleted: true, employeeId };
  }

  // Soft delete — keep record but mark inactive
  return store.updateEmployee(employeeId, { isActive: false });
}

/**
 * Submit Timesheet
 */
async function submitTimesheet(store, { employeeId, periodStart, periodEnd, hoursWorked, notes }) {
  assert(employeeId != null, "employeeId required");
  const start = toDate(periodStart);
  const end   = toDate(periodEnd);
  const hours = Number(hoursWorked);

  assert(end > start, "periodEnd must be after periodStart");
  assert(hours > 0 && hours <= 120, "hoursWorked must be between 0 and 120");

  const emp = await store.getEmployeeById(employeeId);
  assert(emp, "Employee not found");
  assert(emp.isActive !== false, "Employee is inactive");

  const existing = (await store.listTimesheetsByEmployee(employeeId)).find(
    (t) => +new Date(t.periodStart) === +start && +new Date(t.periodEnd) === +end
  );
  assert(!existing, "Timesheet already exists for this period");

  const ts = await store.createTimesheet({
    employeeId,
    periodStart: toMySQLDate(start),
    periodEnd:   toMySQLDate(end),
    hoursWorked: round2(hours),
    notes: notes || "",
  });

  return store.updateTimesheet(ts.id, {
    status: TimesheetStatus.SUBMITTED,
    submittedAt: new Date().toISOString(),
  });
}

/**
 * View timesheets for an employee
 */
async function viewMyTimesheets(store, employeeId) {
  assert(employeeId != null, "employeeId required");
  const emp = await store.getEmployeeById(employeeId);
  assert(emp, "Employee not found");
  return store.listTimesheetsByEmployee(employeeId);
}

// ================================================================
// BENEFIT ALGORITHMS
// ================================================================

/**
 * Add a benefit to an employee
 */
async function addBenefit(store, { employeeId, benefitType, planName, employeeCost, employerCost, isEnrolled, effectiveDate, notes }) {
  assert(employeeId != null, "employeeId required");
  assert(VALID_BENEFIT_TYPES.includes(benefitType), `benefitType must be one of: ${VALID_BENEFIT_TYPES.join(", ")}`);

  const emp = await store.getEmployeeById(employeeId);
  assert(emp, "Employee not found");

  const eCost = Number(employeeCost ?? 0);
  const erCost = Number(employerCost ?? 0);
  assert(eCost >= 0, "employeeCost must be >= 0");
  assert(erCost >= 0, "employerCost must be >= 0");

  return store.createBenefit({
    employeeId,
    benefitType,
    planName: planName || null,
    employeeCost: round2(eCost),
    employerCost: round2(erCost),
    isEnrolled: isEnrolled !== undefined ? Boolean(isEnrolled) : true,
    effectiveDate: effectiveDate || null,
    notes: notes || null,
  });
}

/**
 * Modify a benefit
 */
async function modifyBenefit(store, { benefitId, planName, employeeCost, employerCost, isEnrolled, effectiveDate, notes }) {
  assert(benefitId != null, "benefitId required");
  const benefit = await store.getBenefitById(benefitId);
  assert(benefit, "Benefit not found");

  const patch = {};
  if (planName      !== undefined) patch.planName      = planName;
  if (employeeCost  !== undefined) { const v = Number(employeeCost); assert(v >= 0, "employeeCost must be >= 0"); patch.employeeCost = round2(v); }
  if (employerCost  !== undefined) { const v = Number(employerCost); assert(v >= 0, "employerCost must be >= 0"); patch.employerCost = round2(v); }
  if (isEnrolled    !== undefined) patch.isEnrolled    = Boolean(isEnrolled);
  if (effectiveDate !== undefined) patch.effectiveDate = effectiveDate;
  if (notes         !== undefined) patch.notes         = notes;

  assert(Object.keys(patch).length > 0, "No fields provided to update");
  return store.updateBenefit(benefitId, patch);
}

/**
 * Delete a benefit
 */
async function deleteBenefit(store, { benefitId }) {
  assert(benefitId != null, "benefitId required");
  const benefit = await store.getBenefitById(benefitId);
  assert(benefit, "Benefit not found");
  await store.deleteBenefit(benefitId);
  return { deleted: true, benefitId };
}

/**
 * Get all benefits for an employee
 */
async function getEmployeeBenefits(store, employeeId) {
  assert(employeeId != null, "employeeId required");
  const emp = await store.getEmployeeById(employeeId);
  assert(emp, "Employee not found");
  const benefits = await store.listBenefitsByEmployee(employeeId);

  const totalEmployeeCost = round2(benefits.filter(b => b.isEnrolled).reduce((s, b) => s + Number(b.employeeCost), 0));
  const totalEmployerCost = round2(benefits.filter(b => b.isEnrolled).reduce((s, b) => s + Number(b.employerCost), 0));
  return { employee: emp, benefits, totalEmployeeCost, totalEmployerCost };
}

// ================================================================
// DEDUCTION ALGORITHMS
// ================================================================

/**
 * Add a tax/deduction to an employee
 */
async function addDeduction(store, { employeeId, deductionType, label, isPercentage, amount, isActive, notes }) {
  assert(employeeId != null, "employeeId required");
  assert(VALID_DEDUCTION_TYPES.includes(deductionType), `deductionType must be one of: ${VALID_DEDUCTION_TYPES.join(", ")}`);

  const emp = await store.getEmployeeById(employeeId);
  assert(emp, "Employee not found");

  const val = Number(amount ?? 0);
  assert(val >= 0, "amount must be >= 0");
  if (isPercentage) assert(val <= 100, "Percentage amount must be <= 100");

  return store.createDeduction({
    employeeId,
    deductionType,
    label: label || null,
    isPercentage: isPercentage !== undefined ? Boolean(isPercentage) : true,
    amount: val,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    notes: notes || null,
  });
}

/**
 * Modify a deduction
 */
async function modifyDeduction(store, { deductionId, label, isPercentage, amount, isActive, notes }) {
  assert(deductionId != null, "deductionId required");
  const ded = await store.getDeductionById(deductionId);
  assert(ded, "Deduction not found");

  const patch = {};
  if (label        !== undefined) patch.label        = label;
  if (isPercentage !== undefined) patch.isPercentage  = Boolean(isPercentage);
  if (amount       !== undefined) {
    const val = Number(amount);
    assert(val >= 0, "amount must be >= 0");
    patch.amount = val;
  }
  if (isActive !== undefined) patch.isActive = Boolean(isActive);
  if (notes    !== undefined) patch.notes    = notes;

  assert(Object.keys(patch).length > 0, "No fields provided to update");
  return store.updateDeduction(deductionId, patch);
}

/**
 * Delete a deduction
 */
async function deleteDeduction(store, { deductionId }) {
  assert(deductionId != null, "deductionId required");
  const ded = await store.getDeductionById(deductionId);
  assert(ded, "Deduction not found");
  await store.deleteDeduction(deductionId);
  return { deleted: true, deductionId };
}

/**
 * Get all deductions for an employee
 */
async function getEmployeeDeductions(store, employeeId) {
  assert(employeeId != null, "employeeId required");
  const emp = await store.getEmployeeById(employeeId);
  assert(emp, "Employee not found");
  const deductions = await store.listDeductionsByEmployee(employeeId);
  return { employee: emp, deductions };
}

// ================================================================
// ADMIN ALGORITHMS
// ================================================================

/**
 * Approve Timesheet
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
 * Reject Timesheet
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
 * Run Payroll — computes gross, applies active deductions & enrolled benefits, returns net pay
 *
 * Algorithm steps:
 * 1) Find APPROVED timesheets matching the period
 * 2) grossPay = hoursWorked * hourlyRate
 * 3) taxDeductions = sum of active percentage/flat deductions
 * 4) benefitDeductions = sum of enrolled benefit employee costs
 * 5) totalDeductions = taxDeductions + benefitDeductions
 * 6) netPay = grossPay - totalDeductions  (floor at 0)
 * 7) Persist payrollRun, payrollLines, paystubs
 * 8) Mark timesheets PAID
 */
async function runPayroll(store, { periodStart, periodEnd, executedBy }) {
  const start = toDate(periodStart);
  const end   = toDate(periodEnd);
  assert(end > start, "Invalid payroll period");

  const approved = await store.listTimesheetsByStatus(TimesheetStatus.APPROVED);
  const eligible  = approved.filter(
    (t) => +new Date(t.periodStart) === +start && +new Date(t.periodEnd) === +end
  );
  assert(eligible.length > 0, "No approved timesheets found for this period");

  let runGross = 0;
  let runDeductions = 0;
  let runNet = 0;
  const computed = [];

  for (const ts of eligible) {
    const emp = await store.getEmployeeById(ts.employeeId);
    assert(emp, `Employee missing for timesheet ${ts.id}`);

    const grossPay = round2(Number(ts.hoursWorked) * Number(emp.hourlyRate));

    // --- Tax & other deductions ---
    const allDeductions = await store.listDeductionsByEmployee(emp.id);
    const activeDeductions = allDeductions.filter((d) => d.isActive);
    let taxTotal = 0;
    for (const d of activeDeductions) {
      if (d.isPercentage) {
        taxTotal += round2((grossPay * Number(d.amount)) / 100);
      } else {
        taxTotal += Number(d.amount);
      }
    }
    taxTotal = round2(taxTotal);

    // --- Benefit deductions (employee cost per pay period) ---
    const allBenefits = await store.listBenefitsByEmployee(emp.id);
    const enrolledBenefits = allBenefits.filter((b) => b.isEnrolled);
    const benefitTotal = round2(enrolledBenefits.reduce((s, b) => s + Number(b.employeeCost), 0));

    const totalDeductionsForEmp = round2(taxTotal + benefitTotal);
    const netPay = round2(Math.max(0, grossPay - totalDeductionsForEmp));

    runGross      = round2(runGross + grossPay);
    runDeductions = round2(runDeductions + totalDeductionsForEmp);
    runNet        = round2(runNet + netPay);

    computed.push({ ts, emp, grossPay, totalDeductionsForEmp, netPay, activeDeductions, enrolledBenefits });
  }

  const payrollRun = await store.createPayrollRun({
    periodStart:     toMySQLDate(start),
    periodEnd:       toMySQLDate(end),
    executedBy:      executedBy ?? null,
    totalGross:      runGross,
    totalDeductions: runDeductions,
    totalNet:        runNet,
  });

  const lines = [];
  for (const item of computed) {
    const line = await store.createPayrollLine({
      payrollRunId:    payrollRun.id,
      employeeId:      item.emp.id,
      timesheetId:     item.ts.id,
      grossPay:        item.grossPay,
      totalDeductions: item.totalDeductionsForEmp,
      netPay:          item.netPay,
    });

    await store.createPaystub({
      employeeId:      item.emp.id,
      payrollRunId:    payrollRun.id,
      grossPay:        item.grossPay,
      totalDeductions: item.totalDeductionsForEmp,
      netPay:          item.netPay,
    });

    await store.updateTimesheet(item.ts.id, {
      status: TimesheetStatus.PAID,
      paidAt: new Date().toISOString(),
    });

    lines.push({
      employee:       { id: item.emp.id, fullName: item.emp.fullName },
      grossPay:       item.grossPay,
      deductions:     item.activeDeductions,
      benefits:       item.enrolledBenefits,
      totalDeductions: item.totalDeductionsForEmp,
      netPay:         item.netPay,
    });
  }

  return {
    payrollRun,
    count:      computed.length,
    totalGross: runGross,
    totalDeductions: runDeductions,
    totalNet:   runNet,
    lines,
  };
}

module.exports = {
  TimesheetStatus,
  VALID_BENEFIT_TYPES,
  VALID_DEDUCTION_TYPES,
  // Employee
  addEmployee,
  modifyEmployee,
  deleteEmployee,
  submitTimesheet,
  viewMyTimesheets,
  // Benefits
  addBenefit,
  modifyBenefit,
  deleteBenefit,
  getEmployeeBenefits,
  // Deductions
  addDeduction,
  modifyDeduction,
  deleteDeduction,
  getEmployeeDeductions,
  // Admin
  approveTimesheet,
  rejectTimesheet,
  runPayroll,
};
