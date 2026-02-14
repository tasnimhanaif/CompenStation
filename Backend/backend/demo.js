const { makeMemoryStore } = require("./store.memory");
const {
  addEmployee,
  submitTimesheet,
  approveTimesheet,
  runPayroll,
  viewMyTimesheets
} = require("./algorithms");

(async () => {
  const store = makeMemoryStore();

  // Admin adds employee
  const emp = await addEmployee(store, {
    fullName: "Mahir Shahriyar",
    email: "mahir@mail.com",
    hourlyRate: 25
  });

  // Employee submits timesheet
  const ts = await submitTimesheet(store, {
    employeeId: emp.id,
    periodStart: "2026-02-01",
    periodEnd: "2026-02-15",
    hoursWorked: 72,
    notes: "Normal pay period"
  });

  // Admin approves
  const approved = await approveTimesheet(store, { timesheetId: ts.id, reviewedBy: 999 });

  // Admin runs payroll
  const payroll = await runPayroll(store, {
    periodStart: "2026-02-01",
    periodEnd: "2026-02-15",
    executedBy: 999
  });

  // Employee views history
  const myTs = await viewMyTimesheets(store, emp.id);

  console.log("EMP:", emp);
  console.log("SUBMITTED:", ts);
  console.log("APPROVED:", approved);
  console.log("PAYROLL:", payroll);
  console.log("MY TIMESHEETS:", myTs);
  console.log("DUMP:", store._dump());
})();
