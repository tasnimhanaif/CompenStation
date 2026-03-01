const pool = require("./db.js");

/* =============================
   EMPLOYEE METHODS
============================= */

async function createEmployee({ fullName, email, hourlyRate }) {
  const [result] = await pool.execute(
    `INSERT INTO employees (fullName, email, hourlyRate)
     VALUES (?, ?, ?)`,
    [fullName, email, hourlyRate]
  );

  return getEmployeeById(result.insertId);
}

async function getEmployeeById(id) {
  const [rows] = await pool.execute(
    `SELECT * FROM employees WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function getEmployeeByEmail(email) {
  const [rows] = await pool.execute(
    `SELECT * FROM employees WHERE email = ?`,
    [email]
  );
  return rows[0] || null;
}

async function listEmployees() {
  const [rows] = await pool.execute(`SELECT * FROM employees`);
  return rows;
}

/* =============================
   TIMESHEET METHODS
============================= */

async function createTimesheet(data) {
  const [result] = await pool.execute(
    `INSERT INTO timesheets 
     (employeeId, periodStart, periodEnd, hoursWorked, notes)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.employeeId,
      data.periodStart,
      data.periodEnd,
      data.hoursWorked,
      data.notes,
    ]
  );

  return getTimesheetById(result.insertId);
}

async function getTimesheetById(id) {
  const [rows] = await pool.execute(
    `SELECT * FROM timesheets WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function listTimesheetsByEmployee(employeeId) {
  const [rows] = await pool.execute(
    `SELECT * FROM timesheets WHERE employeeId = ?`,
    [employeeId]
  );
  return rows;
}

async function listTimesheetsByStatus(status) {
  const [rows] = await pool.execute(
    `SELECT * FROM timesheets WHERE status = ?`,
    [status]
  );
  return rows;
}

async function updateTimesheet(id, patchObj) {
  const fields = [];
  const values = [];

  for (const key in patchObj) {
    fields.push(`${key} = ?`);
    values.push(patchObj[key]);
  }

  values.push(id);

  await pool.execute(
    `UPDATE timesheets SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  return getTimesheetById(id);
}

/* =============================
   PAYROLL METHODS
============================= */

async function createPayrollRun(data) {
  const [result] = await pool.execute(
    `INSERT INTO payroll_runs
     (periodStart, periodEnd, executedBy, totalGross)
     VALUES (?, ?, ?, ?)`,
    [data.periodStart, data.periodEnd, data.executedBy, data.totalGross]
  );

  return { id: result.insertId, ...data };
}

async function createPayrollLine(data) {
  await pool.execute(
    `INSERT INTO payroll_lines
     (payrollRunId, employeeId, timesheetId, grossPay)
     VALUES (?, ?, ?, ?)`,
    [data.payrollRunId, data.employeeId, data.timesheetId, data.grossPay]
  );
}

async function createPaystub(data) {
  await pool.execute(
    `INSERT INTO paystubs
     (employeeId, payrollRunId, grossPay)
     VALUES (?, ?, ?)`,
    [data.employeeId, data.payrollRunId, data.grossPay]
  );
}

module.exports = {
  createEmployee,
  getEmployeeById,
  getEmployeeByEmail,
  listEmployees,
  createTimesheet,
  getTimesheetById,
  listTimesheetsByEmployee,
  listTimesheetsByStatus,
  updateTimesheet,
  createPayrollRun,
  createPayrollLine,
  createPaystub,
};















/* store.memory.js
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
*/