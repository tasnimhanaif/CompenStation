// store.memory.js
// Fake DB for testing algorithms quickly.

let nextId = 1;
const id = () => nextId++;

function makeMemoryStore() {
  const employees = [];
  const timesheets = [];
  const payrollRuns = [];
  const payrollLines = [];
  const paystubs = [];

  return {
    // Employees
    async createEmployee({ fullName, email, hourlyRate }) {
      const emp = { id: id(), fullName, email, hourlyRate, isActive: true, createdAt: new Date().toISOString() };
      employees.push(emp);
      return emp;
    },
    async getEmployeeById(empId) {
      return employees.find((e) => e.id === empId) || null;
    },
    async getEmployeeByEmail(email) {
      return employees.find((e) => e.email === email) || null;
    },
    async listEmployees() {
      return [...employees];
    },

    // Timesheets
    async createTimesheet({ employeeId, periodStart, periodEnd, hoursWorked, notes }) {
      const ts = {
        id: id(),
        employeeId,
        periodStart,
        periodEnd,
        hoursWorked,
        notes,
        status: "DRAFT",
        submittedAt: null,
        reviewedAt: null,
        reviewedBy: null,
        paidAt: null,
        rejectionReason: "",
        createdAt: new Date().toISOString(),
      };
      timesheets.push(ts);
      return ts;
    },
    async getTimesheetById(tsId) {
      return timesheets.find((t) => t.id === tsId) || null;
    },
    async listTimesheetsByEmployee(employeeId) {
      return timesheets.filter((t) => t.employeeId === employeeId);
    },
    async listTimesheetsByStatus(status) {
      return timesheets.filter((t) => t.status === status);
    },
    async updateTimesheet(tsId, patch) {
      const idx = timesheets.findIndex((t) => t.id === tsId);
      if (idx < 0) return null;
      timesheets[idx] = { ...timesheets[idx], ...patch, updatedAt: new Date().toISOString() };
      return timesheets[idx];
    },

    // Payroll
    async createPayrollRun({ periodStart, periodEnd, executedBy, totalGross }) {
      const pr = { id: id(), periodStart, periodEnd, executedBy, totalGross, executedAt: new Date().toISOString() };
      payrollRuns.push(pr);
      return pr;
    },
    async createPayrollLine({ payrollRunId, employeeId, timesheetId, grossPay }) {
      const line = { id: id(), payrollRunId, employeeId, timesheetId, grossPay };
      payrollLines.push(line);
      return line;
    },
    async createPaystub({ employeeId, payrollRunId, grossPay }) {
      const stub = { id: id(), employeeId, payrollRunId, grossPay, issuedAt: new Date().toISOString() };
      paystubs.push(stub);
      return stub;
    },

    // Debug helpers
    _dump() {
      return { employees, timesheets, payrollRuns, payrollLines, paystubs };
    },
  };
}

module.exports = { makeMemoryStore };
