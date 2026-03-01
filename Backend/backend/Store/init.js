const db = require("./db.js");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      hourlyRate REAL NOT NULL,
      isActive INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS timesheets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employeeId INTEGER NOT NULL,
      periodStart TEXT NOT NULL,
      periodEnd TEXT NOT NULL,
      hoursWorked REAL NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'DRAFT',
      submittedAt TEXT,
      reviewedAt TEXT,
      reviewedBy TEXT,
      rejectionReason TEXT,
      paidAt TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(employeeId) REFERENCES employees(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS payroll_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      periodStart TEXT,
      periodEnd TEXT,
      executedBy TEXT,
      totalGross REAL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS payroll_lines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payrollRunId INTEGER,
      employeeId INTEGER,
      timesheetId INTEGER,
      grossPay REAL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS paystubs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employeeId INTEGER,
      payrollRunId INTEGER,
      grossPay REAL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

console.log("Tables created successfully.");