// Run once to create all tables: node Store/init.js

const pool = require("./db.js");

async function init() {
  const conn = await pool.getConnection();

  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        hourlyRate DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS timesheets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employeeId INT NOT NULL,
        periodStart DATETIME NOT NULL,
        periodEnd DATETIME NOT NULL,
        hoursWorked DECIMAL(6,2) NOT NULL,
        notes TEXT,
        status ENUM('DRAFT','SUBMITTED','APPROVED','REJECTED','PAID') DEFAULT 'DRAFT',
        submittedAt DATETIME NULL,
        reviewedAt DATETIME NULL,
        reviewedBy VARCHAR(255) NULL,
        rejectionReason TEXT NULL,
        paidAt DATETIME NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS payroll_runs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        periodStart DATETIME NOT NULL,
        periodEnd DATETIME NOT NULL,
        executedBy VARCHAR(255),
        totalGross DECIMAL(12,2) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS payroll_lines (
        id INT AUTO_INCREMENT PRIMARY KEY,
        payrollRunId INT NOT NULL,
        employeeId INT NOT NULL,
        timesheetId INT NOT NULL,
        grossPay DECIMAL(10,2) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (payrollRunId) REFERENCES payroll_runs(id) ON DELETE CASCADE,
        FOREIGN KEY (employeeId) REFERENCES employees(id),
        FOREIGN KEY (timesheetId) REFERENCES timesheets(id)
      )
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS paystubs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employeeId INT NOT NULL,
        payrollRunId INT NOT NULL,
        grossPay DECIMAL(10,2) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employeeId) REFERENCES employees(id),
        FOREIGN KEY (payrollRunId) REFERENCES payroll_runs(id)
      )
    `);

    console.log("✅ All tables created successfully.");
  } catch (err) {
    console.error("❌ Error creating tables:", err.message);
  } finally {
    conn.release();
    process.exit(0);
  }
}

init();