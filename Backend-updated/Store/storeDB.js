// Store/storeDB.js
// MySQL-backed store — all data persists to the Aiven database.
// Drop-in replacement for storeMemory.js.
// Every method mirrors the storeMemory API so routes need no changes.
// Updated to handle all API contract fields.

const pool = require("./db.js");

// ─── helpers ──────────────────────────────────────────────────────────────────
function toISO(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 19).replace("T", " ");
}

async function q(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// ─── EMPLOYEES ────────────────────────────────────────────────────────────────
// API contract fields: firstName, middleName (opt), lastName, birthdate, sex,
// employeeCode (8-digit), employmentType, payType, hourlyRate, email, phone,
// address, city, state, zip, ssn, department, jobTitle,
// currentStatus, statusChangeDate, companyId

async function createEmployee({
  firstName, middleName, lastName,
  birthdate, sex,
  employeeCode,
  employmentType, payType, hourlyRate,
  email, phone,
  address, city, state, zip,
  ssn,
  department, jobTitle,
  currentStatus, companyId
}) {
  const [result] = await pool.execute(
    `INSERT INTO employees
      (firstName, middleName, lastName, birthdate, sex, employeeCode,
       employmentType, payType, hourlyRate, email, phone,
       address, city, state, zip, ssn,
       department, jobTitle, currentStatus, companyId, isActive)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)`,
    [
      firstName, middleName ?? null, lastName,
      birthdate ?? null, sex ?? null,
      employeeCode ?? null,
      employmentType ?? "full-time", payType ?? "hourly", hourlyRate ?? 0,
      email, phone ?? null,
      address ?? null, city ?? null, state ?? null, zip ?? null,
      ssn ?? null,
      department ?? null, jobTitle ?? null,
      currentStatus ?? "active", companyId ?? null
    ]
  );
  return getEmployeeById(result.insertId);
}

async function getEmployeeById(id) {
  const rows = await q("SELECT * FROM employees WHERE id = ?", [id]);
  return rows[0] ?? null;
}

async function getEmployeeByEmail(email) {
  const rows = await q("SELECT * FROM employees WHERE email = ?", [email]);
  return rows[0] ?? null;
}

async function listEmployees() {
  return q("SELECT * FROM employees ORDER BY id ASC");
}

// Search employees by name (first, last, or full computed name)
async function searchEmployeesByName(name) {
  const like = `%${name}%`;
  return q(
    `SELECT * FROM employees
     WHERE firstName LIKE ? OR lastName LIKE ? OR CONCAT(firstName, ' ', lastName) LIKE ?
     ORDER BY lastName ASC`,
    [like, like, like]
  );
}

async function updateEmployee(id, patch) {
  const fields = [];
  const vals   = [];
  const allowed = [
    "firstName","middleName","lastName","birthdate","sex","employeeCode",
    "employmentType","payType","hourlyRate","email","phone",
    "address","city","state","zip","ssn",
    "department","jobTitle","currentStatus","statusChangeDate","companyId","isActive"
  ];
  for (const key of allowed) {
    if (patch[key] !== undefined) {
      fields.push(`${key} = ?`);
      vals.push(patch[key]);
    }
  }
  if (!fields.length) return getEmployeeById(id);
  vals.push(id);
  await pool.execute(`UPDATE employees SET ${fields.join(", ")} WHERE id = ?`, vals);
  return getEmployeeById(id);
}

async function deleteEmployee(id) {
  await pool.execute("DELETE FROM employees WHERE id = ?", [id]);
  return true;
}

// ─── TIMESHEETS ───────────────────────────────────────────────────────────────
async function createTimesheet({ employeeId, periodStart, periodEnd, hoursWorked, notes }) {
  const [r] = await pool.execute(
    "INSERT INTO timesheets (employeeId, periodStart, periodEnd, hoursWorked, notes, status) VALUES (?,?,?,?,?,'DRAFT')",
    [employeeId, toISO(periodStart), toISO(periodEnd), hoursWorked, notes ?? ""]
  );
  return getTimesheetById(r.insertId);
}

async function getTimesheetById(id) {
  const rows = await q("SELECT * FROM timesheets WHERE id = ?", [id]);
  return rows[0] ?? null;
}

async function listTimesheetsByEmployee(employeeId) {
  return q("SELECT * FROM timesheets WHERE employeeId = ? ORDER BY id ASC", [employeeId]);
}

async function listTimesheetsByStatus(status) {
  return q("SELECT * FROM timesheets WHERE status = ? ORDER BY id ASC", [status]);
}

async function updateTimesheet(id, patch) {
  const fields = [];
  const vals   = [];
  const allowed = ["status","submittedAt","reviewedAt","reviewedBy","rejectionReason","paidAt","hoursWorked","notes"];
  for (const key of allowed) {
    if (patch[key] !== undefined) { fields.push(`${key} = ?`); vals.push(patch[key]); }
  }
  if (!fields.length) return getTimesheetById(id);
  vals.push(id);
  await pool.execute(`UPDATE timesheets SET ${fields.join(", ")} WHERE id = ?`, vals);
  return getTimesheetById(id);
}

// ─── BENEFITS (per-employee) ──────────────────────────────────────────────────
async function createBenefit({ employeeId, benefitType, planName, employeeCost, employerCost, isEnrolled, effectiveDate, notes }) {
  const [r] = await pool.execute(
    "INSERT INTO benefits (employeeId, benefitType, planName, employeeCost, employerCost, isEnrolled, effectiveDate, notes) VALUES (?,?,?,?,?,?,?,?)",
    [employeeId, benefitType, planName ?? null, employeeCost ?? 0, employerCost ?? 0, isEnrolled ? 1 : 1, effectiveDate ?? null, notes ?? null]
  );
  return getBenefitById(r.insertId);
}

async function getBenefitById(id) {
  const rows = await q("SELECT * FROM benefits WHERE id = ?", [id]);
  return rows[0] ?? null;
}

async function listBenefitsByEmployee(employeeId) {
  return q("SELECT * FROM benefits WHERE employeeId = ?", [employeeId]);
}

async function listAllBenefits() {
  return q("SELECT * FROM benefits ORDER BY id ASC");
}

async function updateBenefit(id, patch) {
  const fields = [];
  const vals   = [];
  for (const key of ["planName","employeeCost","employerCost","isEnrolled","effectiveDate","notes"]) {
    if (patch[key] !== undefined) { fields.push(`${key} = ?`); vals.push(patch[key]); }
  }
  if (!fields.length) return getBenefitById(id);
  vals.push(id);
  await pool.execute(`UPDATE benefits SET ${fields.join(", ")} WHERE id = ?`, vals);
  return getBenefitById(id);
}

async function deleteBenefit(id) {
  await pool.execute("DELETE FROM benefits WHERE id = ?", [id]);
  return true;
}

// ─── DEDUCTIONS (per-employee) ────────────────────────────────────────────────
async function createDeduction({ employeeId, deductionType, label, isPercentage, amount, isActive, notes }) {
  const [r] = await pool.execute(
    "INSERT INTO deductions (employeeId, deductionType, label, isPercentage, amount, isActive, notes) VALUES (?,?,?,?,?,?,?)",
    [employeeId, deductionType, label ?? null, isPercentage ? 1 : 0, amount ?? 0, isActive ? 1 : 1, notes ?? null]
  );
  return getDeductionById(r.insertId);
}

async function getDeductionById(id) {
  const rows = await q("SELECT * FROM deductions WHERE id = ?", [id]);
  return rows[0] ?? null;
}

async function listDeductionsByEmployee(employeeId) {
  return q("SELECT * FROM deductions WHERE employeeId = ?", [employeeId]);
}

async function listAllDeductions() {
  return q("SELECT * FROM deductions ORDER BY id ASC");
}

async function updateDeduction(id, patch) {
  const fields = [];
  const vals   = [];
  for (const key of ["label","isPercentage","amount","isActive","notes"]) {
    if (patch[key] !== undefined) { fields.push(`${key} = ?`); vals.push(patch[key]); }
  }
  if (!fields.length) return getDeductionById(id);
  vals.push(id);
  await pool.execute(`UPDATE deductions SET ${fields.join(", ")} WHERE id = ?`, vals);
  return getDeductionById(id);
}

async function deleteDeduction(id) {
  await pool.execute("DELETE FROM deductions WHERE id = ?", [id]);
  return true;
}

// ─── PAYROLL ──────────────────────────────────────────────────────────────────
// Added employeeCount per API contract
async function createPayrollRun({ periodStart, periodEnd, executedBy, employeeCount, totalGross, totalDeductions, totalNet }) {
  const [r] = await pool.execute(
    "INSERT INTO payroll_runs (periodStart, periodEnd, executedBy, employeeCount, totalGross, totalDeductions, totalNet) VALUES (?,?,?,?,?,?,?)",
    [toISO(periodStart), toISO(periodEnd), executedBy ?? null, employeeCount ?? 0, totalGross, totalDeductions ?? 0, totalNet ?? 0]
  );
  const rows = await q("SELECT * FROM payroll_runs WHERE id = ?", [r.insertId]);
  return rows[0];
}

async function createPayrollLine({ payrollRunId, employeeId, timesheetId, grossPay, totalDeductions, netPay }) {
  const [r] = await pool.execute(
    "INSERT INTO payroll_lines (payrollRunId, employeeId, timesheetId, grossPay, totalDeductions, netPay) VALUES (?,?,?,?,?,?)",
    [payrollRunId, employeeId, timesheetId, grossPay, totalDeductions ?? 0, netPay ?? 0]
  );
  const rows = await q("SELECT * FROM payroll_lines WHERE id = ?", [r.insertId]);
  return rows[0];
}

// Added memo per API contract (Check: memo field)
async function createPaystub({ employeeId, payrollRunId, periodStart, periodEnd, grossPay, totalDeductions, netPay, memo }) {
  const [r] = await pool.execute(
    "INSERT INTO paystubs (employeeId, payrollRunId, periodStart, periodEnd, grossPay, totalDeductions, netPay, memo) VALUES (?,?,?,?,?,?,?,?)",
    [employeeId, payrollRunId, toISO(periodStart), toISO(periodEnd), grossPay, totalDeductions ?? 0, netPay ?? 0, memo ?? null]
  );
  const rows = await q("SELECT * FROM paystubs WHERE id = ?", [r.insertId]);
  return rows[0];
}

async function listPaystubsByEmployee(employeeId) {
  return q("SELECT * FROM paystubs WHERE employeeId = ? ORDER BY id DESC", [employeeId]);
}

async function listAllPaystubs() {
  return q("SELECT * FROM paystubs ORDER BY id DESC");
}

async function listPayrollRuns() {
  return q("SELECT * FROM payroll_runs ORDER BY id DESC");
}

// Dashboard summary: total employees and total net pay for a period
async function getDashboardSummary({ periodStart, periodEnd } = {}) {
  const [empCount]  = await q("SELECT COUNT(*) AS total FROM employees WHERE isActive = 1");
  const [payResult] = await q(
    "SELECT COALESCE(SUM(totalNet), 0) AS totalPay FROM payroll_runs WHERE periodStart >= ? AND periodEnd <= ?",
    [toISO(periodStart) ?? "1970-01-01 00:00:00", toISO(periodEnd) ?? "9999-12-31 23:59:59"]
  );
  return {
    totalEmployees: empCount.total,
    totalPay:       payResult.totalPay
  };
}

// ─── USERS (auth) ─────────────────────────────────────────────────────────────
async function createUser({ fullName, email, phone, username, password, role, employeeId, jobTitle }) {
  const existing = await findUserByUsername(username);
  if (existing) throw new Error("Username already exists");
  const [r] = await pool.execute(
    "INSERT INTO users (fullName, email, phone, username, password, role, employeeId, jobTitle) VALUES (?,?,?,?,?,?,?,?)",
    [fullName, email ?? null, phone ?? null, username, password, role ?? "employee", employeeId ?? null, jobTitle ?? null]
  );
  const rows = await q("SELECT * FROM users WHERE id = ?", [r.insertId]);
  return rows[0];
}

async function findUserByCredentials(username, password) {
  const rows = await q("SELECT * FROM users WHERE username = ? AND password = ?", [username, password]);
  return rows[0] ?? null;
}

async function findUserByUsername(username) {
  const rows = await q("SELECT * FROM users WHERE username = ?", [username]);
  return rows[0] ?? null;
}

async function findUserById(id) {
  const rows = await q("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0] ?? null;
}

// ─── SETTINGS: Benefits catalog ───────────────────────────────────────────────
async function listSettingsBenefits() {
  return q("SELECT * FROM settings_benefits ORDER BY id ASC");
}

async function addSettingsBenefit({ name, percentage }) {
  const [r] = await pool.execute("INSERT INTO settings_benefits (name, percentage) VALUES (?,?)", [name, percentage]);
  const rows = await q("SELECT * FROM settings_benefits WHERE id = ?", [r.insertId]);
  return rows[0];
}

async function updateSettingsBenefit(id, { name, percentage }) {
  const fields = [];
  const vals   = [];
  if (name       !== undefined) { fields.push("name = ?");       vals.push(name); }
  if (percentage !== undefined) { fields.push("percentage = ?"); vals.push(percentage); }
  if (!fields.length) throw new Error("No fields to update");
  vals.push(id);
  await pool.execute(`UPDATE settings_benefits SET ${fields.join(", ")} WHERE id = ?`, vals);
  const rows = await q("SELECT * FROM settings_benefits WHERE id = ?", [id]);
  return rows[0] ?? null;
}

async function removeSettingsBenefit(index) {
  const all = await listSettingsBenefits();
  if (index < 0 || index >= all.length) throw new Error("Benefit index out of range");
  await pool.execute("DELETE FROM settings_benefits WHERE id = ?", [all[index].id]);
  return true;
}

// ─── SETTINGS: Taxes (unified table) ─────────────────────────────────────────
// API contract: tax_ID, Type (state|federal), Percentage
async function listTaxes(type) {
  if (type) return q("SELECT * FROM taxes WHERE type = ? ORDER BY id ASC", [type]);
  return q("SELECT * FROM taxes ORDER BY id ASC");
}

async function addTax({ type, percentage }) {
  if (!["state","federal"].includes(type)) throw new Error("type must be 'state' or 'federal'");
  const [r] = await pool.execute("INSERT INTO taxes (type, percentage) VALUES (?,?)", [type, percentage]);
  const rows = await q("SELECT * FROM taxes WHERE id = ?", [r.insertId]);
  return rows[0];
}

async function updateTax(id, { percentage }) {
  if (percentage === undefined) throw new Error("percentage required");
  await pool.execute("UPDATE taxes SET percentage = ? WHERE id = ?", [percentage, id]);
  const rows = await q("SELECT * FROM taxes WHERE id = ?", [id]);
  return rows[0] ?? null;
}

async function deleteTax(id) {
  await pool.execute("DELETE FROM taxes WHERE id = ?", [id]);
  return true;
}

// ─── Legacy tax helpers (kept for backward compat) ────────────────────────────
async function listStateTaxes() {
  const rows = await q("SELECT percentage FROM settings_state_taxes ORDER BY id ASC");
  return rows.map(r => r.percentage);
}

async function addStateTax({ percentage }) {
  await pool.execute("INSERT INTO settings_state_taxes (percentage) VALUES (?)", [percentage]);
  return percentage;
}

async function listFederalTaxes() {
  const rows = await q("SELECT percentage FROM settings_federal_taxes ORDER BY id ASC");
  return rows.map(r => r.percentage);
}

async function addFederalTax({ percentage }) {
  await pool.execute("INSERT INTO settings_federal_taxes (percentage) VALUES (?)", [percentage]);
  return percentage;
}

// Benefits enrollment stub (employee side)
async function enrollBenefits({ planIds }) {
  return { enrolled: planIds };
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────
module.exports = {
  // employees
  createEmployee, getEmployeeById, getEmployeeByEmail,
  listEmployees, searchEmployeesByName, updateEmployee, deleteEmployee,
  // timesheets
  createTimesheet, getTimesheetById, listTimesheetsByEmployee,
  listTimesheetsByStatus, updateTimesheet,
  // benefits (per-employee)
  createBenefit, getBenefitById, listBenefitsByEmployee,
  listAllBenefits, updateEmployeeBenefit: updateBenefit, deleteBenefit,
  // deductions
  createDeduction, getDeductionById, listDeductionsByEmployee,
  listAllDeductions, updateDeduction, deleteDeduction,
  // payroll
  createPayrollRun, createPayrollLine, createPaystub,
  listPaystubsByEmployee, listAllPaystubs, listPayrollRuns,
  // dashboard
  getDashboardSummary,
  // users
  createUser, findUserByCredentials, findUserByUsername, findUserById,
  // settings — benefits catalog
  listBenefits: listSettingsBenefits,
  addBenefit:   addSettingsBenefit,
  updateBenefit: updateSettingsBenefit,
  removeBenefit: removeSettingsBenefit,
  // settings — taxes (unified)
  listTaxes, addTax, updateTax, deleteTax,
  // settings — legacy separate tax tables
  listStateTaxes, addStateTax, listFederalTaxes, addFederalTax,
  // employee benefits enrollment
  enrollBenefits,
};
