// Store/queries.js
// Centralised SQL query constants for all tables.
// Import the ones you need in each route module.

// ── Employees ────────────────────────────────────────────────────────────────

export const getAllEmployees = `
  SELECT * FROM employees
  WHERE isActive = TRUE
  ORDER BY lastName ASC, firstName ASC
`;

export const getEmployeeById = `
  SELECT * FROM employees
  WHERE id = ? AND isActive = TRUE
`;

export const getEmployeeByEmail = `
  SELECT * FROM employees
  WHERE email = ?
`;

export const insertEmployee = `
  INSERT INTO employees
    (employeeCode, firstName, middleName, lastName,
     birthdate, sex, employmentType, payType, hourlyRate,
     email, phone, address, city, state, zip, ssn,
     department, jobTitle, currentStatus, statusChangeDate, companyId)
  VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

export const updateEmployee = `
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

export const softDeleteEmployee = `
  UPDATE employees
  SET isActive = FALSE, currentStatus = 'terminated', statusChangeDate = NOW()
  WHERE id = ?
`;

// ── Users ────────────────────────────────────────────────────────────────────

export const getAllUsers = `
  SELECT id, fullName, email, phone, username, role, employeeId, jobTitle, createdAt
  FROM users
  ORDER BY fullName ASC
`;

export const getUserById = `
  SELECT id, fullName, email, phone, username, role, employeeId, jobTitle, createdAt
  FROM users
  WHERE id = ?
`;

export const getUserByUsername = `
  SELECT * FROM users
  WHERE username = ?
`;

export const insertUser = `
  INSERT INTO users (fullName, email, phone, username, password, role, employeeId, jobTitle)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

export const updateUser = `
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

export const updateUserPassword = `
  UPDATE users SET password = ? WHERE id = ?
`;

// ── Timesheets ───────────────────────────────────────────────────────────────

export const getAllTimesheets = `
  SELECT t.*, CONCAT(e.firstName, ' ', e.lastName) AS employeeName
  FROM timesheets t
  JOIN employees e ON t.employeeId = e.id
  ORDER BY t.periodStart DESC
`;

export const getTimesheetsByEmployee = `
  SELECT * FROM timesheets
  WHERE employeeId = ?
  ORDER BY periodStart DESC
`;

export const getTimesheetById = `
  SELECT t.*, CONCAT(e.firstName, ' ', e.lastName) AS employeeName
  FROM timesheets t
  JOIN employees e ON t.employeeId = e.id
  WHERE t.id = ?
`;

export const getTimesheetsByStatus = `
  SELECT t.*, CONCAT(e.firstName, ' ', e.lastName) AS employeeName
  FROM timesheets t
  JOIN employees e ON t.employeeId = e.id
  WHERE t.status = ?
  ORDER BY t.periodStart DESC
`;

export const insertTimesheet = `
  INSERT INTO timesheets (employeeId, periodStart, periodEnd, hoursWorked, notes, status)
  VALUES (?, ?, ?, ?, ?, 'DRAFT')
`;

export const updateTimesheetStatus = `
  UPDATE timesheets SET
    status          = ?,
    reviewedAt      = NOW(),
    reviewedBy      = ?,
    rejectionReason = ?
  WHERE id = ?
`;

export const markTimesheetPaid = `
  UPDATE timesheets SET status = 'PAID', paidAt = NOW()
  WHERE id = ?
`;

// ── Benefits ─────────────────────────────────────────────────────────────────

export const getBenefitsByEmployee = `
  SELECT * FROM benefits
  WHERE employeeId = ?
  ORDER BY benefitType ASC
`;

export const insertBenefit = `
  INSERT INTO benefits
    (employeeId, benefitType, planName, employeeCost, employerCost, isEnrolled, effectiveDate, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

export const updateBenefit = `
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

export const deleteBenefit = `
  DELETE FROM benefits WHERE id = ? AND employeeId = ?
`;

// ── Deductions ───────────────────────────────────────────────────────────────

export const getDeductionsByEmployee = `
  SELECT * FROM deductions
  WHERE employeeId = ? AND isActive = TRUE
  ORDER BY deductionType ASC
`;

export const insertDeduction = `
  INSERT INTO deductions
    (employeeId, deductionType, label, isPercentage, amount, notes)
  VALUES (?, ?, ?, ?, ?, ?)
`;

export const updateDeduction = `
  UPDATE deductions SET
    deductionType = ?,
    label         = ?,
    isPercentage  = ?,
    amount        = ?,
    notes         = ?
  WHERE id = ? AND employeeId = ?
`;

export const deactivateDeduction = `
  UPDATE deductions SET isActive = FALSE WHERE id = ?
`;

// ── Payroll Runs ─────────────────────────────────────────────────────────────

export const getAllPayrollRuns = `
  SELECT * FROM payroll_runs
  ORDER BY periodStart DESC
`;

export const getPayrollRunById = `
  SELECT * FROM payroll_runs WHERE id = ?
`;

export const insertPayrollRun = `
  INSERT INTO payroll_runs
    (periodStart, periodEnd, executedBy, employeeCount, totalGross, totalDeductions, totalNet)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`;

// ── Payroll Lines ────────────────────────────────────────────────────────────

export const getPayrollLinesByRun = `
  SELECT pl.*,
    CONCAT(e.firstName, ' ', e.lastName) AS employeeName,
    e.jobTitle,
    e.department
  FROM payroll_lines pl
  JOIN employees e ON pl.employeeId = e.id
  WHERE pl.payrollRunId = ?
  ORDER BY e.lastName ASC, e.firstName ASC
`;

export const getPayrollLinesByEmployee = `
  SELECT pl.*, pr.periodStart, pr.periodEnd
  FROM payroll_lines pl
  JOIN payroll_runs pr ON pl.payrollRunId = pr.id
  WHERE pl.employeeId = ?
  ORDER BY pr.periodStart DESC
`;

export const insertPayrollLine = `
  INSERT INTO payroll_lines
    (payrollRunId, employeeId, timesheetId, grossPay, totalDeductions, netPay)
  VALUES (?, ?, ?, ?, ?, ?)
`;

// ── Paystubs ─────────────────────────────────────────────────────────────────

export const getPaystubsByEmployee = `
  SELECT ps.*,
    CONCAT(e.firstName, ' ', e.lastName) AS paidTo
  FROM paystubs ps
  JOIN employees e ON ps.employeeId = e.id
  WHERE ps.employeeId = ?
  ORDER BY ps.createdAt DESC
`;

export const getPaystubById = `
  SELECT ps.*,
    CONCAT(e.firstName, ' ', e.lastName) AS paidTo
  FROM paystubs ps
  JOIN employees e ON ps.employeeId = e.id
  WHERE ps.id = ?
`;

export const insertPaystub = `
  INSERT INTO paystubs
    (employeeId, payrollRunId, periodStart, periodEnd, grossPay, totalDeductions, netPay, memo)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

// ── Settings: Benefits Catalog ───────────────────────────────────────────────

export const getAllSettingsBenefits = `
  SELECT * FROM settings_benefits
  ORDER BY name ASC
`;

export const insertSettingsBenefit = `
  INSERT INTO settings_benefits (name, percentage)
  VALUES (?, ?)
`;

export const updateSettingsBenefit = `
  UPDATE settings_benefits SET name = ?, percentage = ? WHERE id = ?
`;

export const deleteSettingsBenefit = `
  DELETE FROM settings_benefits WHERE id = ?
`;

// ── Settings: Taxes ──────────────────────────────────────────────────────────

export const getAllTaxes = `
  SELECT * FROM taxes
  ORDER BY type ASC
`;

export const getTaxByType = `
  SELECT * FROM taxes WHERE type = ?
`;

export const upsertTax = `
  INSERT INTO taxes (type, percentage)
  VALUES (?, ?)
  ON DUPLICATE KEY UPDATE percentage = VALUES(percentage)
`;

export const deleteTax = `
  DELETE FROM taxes WHERE id = ?
`;
