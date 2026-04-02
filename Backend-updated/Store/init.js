// Store/init.js
// Run ONCE to create all tables: node Store/init.js
// Safe to re-run (CREATE TABLE IF NOT EXISTS)

const pool = require("./db.js");

async function init() {
  const conn = await pool.getConnection();
  try {
    await conn.execute(`CREATE TABLE IF NOT EXISTS employees (id INT AUTO_INCREMENT PRIMARY KEY, fullName VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE, hourlyRate DECIMAL(10,2) NOT NULL DEFAULT 0.00, phone VARCHAR(50) DEFAULT NULL, address VARCHAR(512) DEFAULT NULL, department VARCHAR(255) DEFAULT NULL, jobTitle VARCHAR(255) DEFAULT NULL, isActive BOOLEAN DEFAULT TRUE, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await conn.execute(`CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, fullName VARCHAR(255) NOT NULL, email VARCHAR(255) DEFAULT NULL, phone VARCHAR(50) DEFAULT NULL, username VARCHAR(100) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, role ENUM('admin','employee') DEFAULT 'employee', employeeId INT DEFAULT NULL, jobTitle VARCHAR(255) DEFAULT NULL, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await conn.execute(`CREATE TABLE IF NOT EXISTS timesheets (id INT AUTO_INCREMENT PRIMARY KEY, employeeId INT NOT NULL, periodStart DATETIME NOT NULL, periodEnd DATETIME NOT NULL, hoursWorked DECIMAL(6,2) NOT NULL, notes TEXT, status ENUM('DRAFT','SUBMITTED','APPROVED','REJECTED','PAID') DEFAULT 'DRAFT', submittedAt DATETIME NULL, reviewedAt DATETIME NULL, reviewedBy VARCHAR(255) NULL, rejectionReason TEXT NULL, paidAt DATETIME NULL, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE)`);
    await conn.execute(`CREATE TABLE IF NOT EXISTS benefits (id INT AUTO_INCREMENT PRIMARY KEY, employeeId INT NOT NULL, benefitType VARCHAR(100) NOT NULL, planName VARCHAR(255) DEFAULT NULL, employeeCost DECIMAL(10,2) DEFAULT 0.00, employerCost DECIMAL(10,2) DEFAULT 0.00, isEnrolled BOOLEAN DEFAULT TRUE, effectiveDate DATE DEFAULT NULL, notes TEXT DEFAULT NULL, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE)`);
    await conn.execute(`CREATE TABLE IF NOT EXISTS deductions (id INT AUTO_INCREMENT PRIMARY KEY, employeeId INT NOT NULL, deductionType VARCHAR(100) NOT NULL, label VARCHAR(255) DEFAULT NULL, isPercentage BOOLEAN DEFAULT TRUE, amount DECIMAL(10,4) DEFAULT 0.0000, isActive BOOLEAN DEFAULT TRUE, notes TEXT DEFAULT NULL, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE)`);
    await conn.execute(`CREATE TABLE IF NOT EXISTS payroll_runs (id INT AUTO_INCREMENT PRIMARY KEY, periodStart DATETIME NOT NULL, periodEnd DATETIME NOT NULL, executedBy VARCHAR(255) DEFAULT NULL, totalGross DECIMAL(12,2) NOT NULL DEFAULT 0.00, totalDeductions DECIMAL(12,2) NOT NULL DEFAULT 0.00, totalNet DECIMAL(12,2) NOT NULL DEFAULT 0.00, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await conn.execute(`CREATE TABLE IF NOT EXISTS payroll_lines (id INT AUTO_INCREMENT PRIMARY KEY, payrollRunId INT NOT NULL, employeeId INT NOT NULL, timesheetId INT NOT NULL, grossPay DECIMAL(10,2) NOT NULL DEFAULT 0.00, totalDeductions DECIMAL(10,2) NOT NULL DEFAULT 0.00, netPay DECIMAL(10,2) NOT NULL DEFAULT 0.00, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (payrollRunId) REFERENCES payroll_runs(id) ON DELETE CASCADE, FOREIGN KEY (employeeId) REFERENCES employees(id), FOREIGN KEY (timesheetId) REFERENCES timesheets(id))`);
    await conn.execute(`CREATE TABLE IF NOT EXISTS paystubs (id INT AUTO_INCREMENT PRIMARY KEY, employeeId INT NOT NULL, payrollRunId INT NOT NULL, periodStart DATETIME DEFAULT NULL, periodEnd DATETIME DEFAULT NULL, grossPay DECIMAL(10,2) NOT NULL DEFAULT 0.00, totalDeductions DECIMAL(10,2) NOT NULL DEFAULT 0.00, netPay DECIMAL(10,2) NOT NULL DEFAULT 0.00, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (employeeId) REFERENCES employees(id), FOREIGN KEY (payrollRunId) REFERENCES payroll_runs(id))`);
    await conn.execute(`CREATE TABLE IF NOT EXISTS settings_benefits (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, percentage DECIMAL(6,2) NOT NULL DEFAULT 0.00, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await conn.execute(`CREATE TABLE IF NOT EXISTS settings_state_taxes (id INT AUTO_INCREMENT PRIMARY KEY, percentage DECIMAL(6,2) NOT NULL, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await conn.execute(`CREATE TABLE IF NOT EXISTS settings_federal_taxes (id INT AUTO_INCREMENT PRIMARY KEY, percentage DECIMAL(6,2) NOT NULL, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    console.log("All tables created successfully.");
  } catch (err) {
    console.error("Error creating tables:", err.message);
  } finally {
    conn.release();
    process.exit(0);
  }
}

init();
