// Store/queries.js
// Centralised SQL query constants for all tables.
// Import the ones you need in each route module.
 
// ── Employees ────────────────────────────────────────────────────────────────
 
const getAllEmployees = `
  SELECT * FROM employees
  WHERE isActive = TRUE
  ORDER BY lastName ASC, firstName ASC
`;
 
const getEmployeeById = `
  SELECT * FROM employees
  WHERE id = ? AND isActive = TRUE
`;
 
const getEmployeeByEmail = `
  SELECT * FROM employees
  WHERE email = ?
`;
 
const insertEmployee = `
  INSERT INTO employees
    (employeeCode, firstName, middleName, lastName,
     birthdate, sex, employmentType, payType, hourlyRate,
     email, phone, address, city, state, zip, ssn,
     department, jobTitle, currentStatus, statusChangeDate, companyId)
  VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;
 
const updateEmployee = `
  UPDATE employees SET
    employeeCode     = ?,
    firstName        = ?,
    middleName       = ?,
    lastName         = ?,
    birthdate        = ?,
    sex              = ?,
    employmentType   = ?,
    payType          = ?,
    hourlyRate       = ?,
    email            = ?,
    phone            = ?,
    address          = ?,
    city             = ?,
    state            = ?,
    zip              = ?,
    ssn              = ?,
    department       = ?,
    jobTitle         = ?,
    currentStatus    = ?,
    statusChangeDate = ?,
    companyId        = ?
  WHERE id = ?
`;
 
const softDeleteEmployee = `
  UPDATE employees
  SET isActive = FALSE, currentStatus = 'terminated', statusChangeDate = NOW()
  WHERE id = ?
`;
 
// ── Users ────────────────────────────────────────────────────────────────────
 
const getAllUsers = `
  SELECT id, fullName, email, phone, username, role, employeeId, jobTitle, createdAt
  FROM users
  ORDER BY fullName ASC
`;
 
const getUserById = `
  SELECT id, fullName, email, phone, username, role, employeeId, jobTitle, createdAt
  FROM users
  WHERE id = ?
`;
 
const getUserByUsername = `
  SELECT * FROM users
  WHERE username = ?
`;
 
const insertUser = `
  INSERT INTO users (fullName, email, phone, username, password, role, employeeId, jobTitle)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;
 
const updateUser = `
  UPDATE users SET
    fullName   = ?,
    email      = ?,
    phone      = ?,
    username   = ?,
    role       = ?,
    employeeId = ?,
    jobTitle   = ?
  WHERE id = ?
`;
 
const updateUserPassword = `
  UPDATE users SET password = ? WHERE id = ?
`;
 
// ── Timesheets ───────────────────────────────────────────────────────────────
 
const getAllTimesheets = `
  SELECT t.*, CONCAT(e.firstName, ' ', e.lastName) AS employeeName
  FROM timesheets t
  JOIN employees e ON t.employeeId = e.id
  ORDER BY t.periodStart DESC
`;
 
const getTimesheetsByEmployee = `
  SELECT * FROM timesheets
  WHERE employeeId = ?
  ORDER BY periodStart DESC
`;
 
const getTimesheetById = `
  SELECT t.*, CONCAT(e.firstName, ' ', e.lastName) AS employeeName
  FROM timesheets t
  JOIN employees e ON t.employeeId = e.id
  WHERE t.id = ?
`;
 
const getTimesheetsByStatus = `
  SELECT t.*, CONCAT(e.firstName, ' ', e.lastName) AS employeeName
  FROM timesheets t
  JOIN employees e ON t.employeeId = e.id
  WHERE t.status = ?
  ORDER BY t.periodStart DESC
`;
 
const insertTimesheet = `
  INSERT INTO timesheets (employeeId, periodStart, periodEnd, hoursWorked, notes, status)
  VALUES (?, ?, ?, ?, ?, 'DRAFT')
`;
 
const updateTimesheetStatus = `
  UPDATE timesheets SET
    status          = ?,
    reviewedAt      = NOW(),
    reviewedBy      = ?,
    rejectionReason = ?
  WHERE id = ?
`;
 
const markTimesheetPaid = `
  UPDATE timesheets SET status = 'PAID', paidAt = NOW()
  WHERE id = ?
`;
 
// ── Benefits ─────────────────────────────────────────────────────────────────
 
const getBenefitsByEmployee = `
  SELECT * FROM benefits
  WHERE employeeId = ?
  ORDER BY benefitType ASC
`;
 
const insertBenefit = `
  INSERT INTO benefits
    (employeeId, benefitType, planName, employeeCost, employerCost, isEnrolled, effectiveDate, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;
 
const updateBenefit = `
  UPDATE benefits SET
    benefitType  = ?,
    planName     = ?,
    employeeCost = ?,
    employerCost = ?,
    isEnrolled   = ?,
    effectiveDate= ?,
    notes        = ?
  WHERE id = ? AND employeeId = ?
`;
 
const deleteBenefit = `
  DELETE FROM benefits WHERE id = ? AND employeeId = ?
`;
 
// ── Deductions ───────────────────────────────────────────────────────────────
 
const getDeductionsByEmployee = `
  SELECT * FROM deductions
  WHERE employeeId = ? AND isActive = TRUE
  ORDER BY deductionType ASC
`;
 
const insertDeduction = `
  INSERT INTO deductions
    (employeeId, deductionType, label, isPercentage, amount, notes)
  VALUES (?, ?, ?, ?, ?, ?)
`;
 
const updateDeduction = `
  UPDATE deductions SET
    deductionType = ?,
    label         = ?,
    isPercentage  = ?,
    amount        = ?,
    notes         = ?
  WHERE id = ? AND employeeId = ?
`;
 
const deactivateDeduction = `
  UPDATE deductions SET isActive = FALSE WHERE id = ?
`;
 
// ── Payroll Runs ─────────────────────────────────────────────────────────────
 
const getAllPayrollRuns = `
  SELECT * FROM payroll_runs
  ORDER BY periodStart DESC
`;
 
const getPayrollRunById = `
  SELECT * FROM payroll_runs WHERE id = ?
`;
 
const insertPayrollRun = `
  INSERT INTO payroll_runs
    (periodStart, periodEnd, executedBy, employeeCount, totalGross, totalDeductions, totalNet)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`;
 
// ── Payroll Lines ────────────────────────────────────────────────────────────
 
const getPayrollLinesByRun = `
  SELECT pl.*,
    CONCAT(e.firstName, ' ', e.lastName) AS employeeName,
    e.jobTitle,
    e.department
  FROM payroll_lines pl
  JOIN employees e ON pl.employeeId = e.id
  WHERE pl.payrollRunId = ?
  ORDER BY e.lastName ASC, e.firstName ASC
`;
 
const getPayrollLinesByEmployee = `
  SELECT pl.*, pr.periodStart, pr.periodEnd
  FROM payroll_lines pl
  JOIN payroll_runs pr ON pl.payrollRunId = pr.id
  WHERE pl.employeeId = ?
  ORDER BY pr.periodStart DESC
`;
 
const insertPayrollLine = `
  INSERT INTO payroll_lines
    (payrollRunId, employeeId, timesheetId, grossPay, totalDeductions, netPay)
  VALUES (?, ?, ?, ?, ?, ?)
`;
 
// ── Paystubs ─────────────────────────────────────────────────────────────────
 
const getPaystubsByEmployee = `
  SELECT ps.*,
    CONCAT(e.firstName, ' ', e.lastName) AS paidTo
  FROM paystubs ps
  JOIN employees e ON ps.employeeId = e.id
  WHERE ps.employeeId = ?
  ORDER BY ps.createdAt DESC
`;
 
const getPaystubById = `
  SELECT ps.*,
    CONCAT(e.firstName, ' ', e.lastName) AS paidTo
  FROM paystubs ps
  JOIN employees e ON ps.employeeId = e.id
  WHERE ps.id = ?
`;
 
const insertPaystub = `
  INSERT INTO paystubs
    (employeeId, payrollRunId, periodStart, periodEnd, grossPay, totalDeductions, netPay, memo)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;
 
// ── Settings: Benefits Catalog ───────────────────────────────────────────────
 
const getAllSettingsBenefits = `
  SELECT * FROM settings_benefits
  ORDER BY name ASC
`;
 
const insertSettingsBenefit = `
  INSERT INTO settings_benefits (name, percentage)
  VALUES (?, ?)
`;
 
const updateSettingsBenefit = `
  UPDATE settings_benefits SET name = ?, percentage = ? WHERE id = ?
`;
 
const deleteSettingsBenefit = `
  DELETE FROM settings_benefits WHERE id = ?
`;
 
// ── Settings: Taxes ──────────────────────────────────────────────────────────
 
const getAllTaxes = `
  SELECT * FROM taxes
  ORDER BY type ASC
`;
 
const getTaxByType = `
  SELECT * FROM taxes WHERE type = ?
`;
 
const upsertTax = `
  INSERT INTO taxes (type, percentage)
  VALUES (?, ?)
  ON DUPLICATE KEY UPDATE percentage = VALUES(percentage)
`;
 
const deleteTax = `
  DELETE FROM taxes WHERE id = ?
`;
 
// ── Exports ──────────────────────────────────────────────────────────────────
 
module.exports = {
  getAllEmployees, getEmployeeById, getEmployeeByEmail,
  insertEmployee, updateEmployee, softDeleteEmployee,
  getAllUsers, getUserById, getUserByUsername,
  insertUser, updateUser, updateUserPassword,
  getAllTimesheets, getTimesheetsByEmployee, getTimesheetById,
  getTimesheetsByStatus, insertTimesheet, updateTimesheetStatus, markTimesheetPaid,
  getBenefitsByEmployee, insertBenefit, updateBenefit, deleteBenefit,
  getDeductionsByEmployee, insertDeduction, updateDeduction, deactivateDeduction,
  getAllPayrollRuns, getPayrollRunById, insertPayrollRun,
  getPayrollLinesByRun, getPayrollLinesByEmployee, insertPayrollLine,
  getPaystubsByEmployee, getPaystubById, insertPaystub,
  getAllSettingsBenefits, insertSettingsBenefit, updateSettingsBenefit, deleteSettingsBenefit,
  getAllTaxes, getTaxByType, upsertTax, deleteTax,
};