CREATE DATABASE payroll_system;
USE payroll_system;

CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    hourlyRate DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE timesheets (
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
);

CREATE TABLE payroll_runs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    periodStart DATETIME NOT NULL,
    periodEnd DATETIME NOT NULL,
    executedBy VARCHAR(255),
    totalGross DECIMAL(12,2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payroll_lines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payrollRunId INT NOT NULL,
    employeeId INT NOT NULL,
    timesheetId INT NOT NULL,
    grossPay DECIMAL(10,2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (payrollRunId) REFERENCES payroll_runs(id) ON DELETE CASCADE,
    FOREIGN KEY (employeeId) REFERENCES employees(id),
    FOREIGN KEY (timesheetId) REFERENCES timesheets(id)
);

CREATE TABLE paystubs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employeeId INT NOT NULL,
    payrollRunId INT NOT NULL,
    grossPay DECIMAL(10,2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (employeeId) REFERENCES employees(id),
    FOREIGN KEY (payrollRunId) REFERENCES payroll_runs(id)
);

CREATE INDEX idx_timesheets_employee ON timesheets(employeeId);
CREATE INDEX idx_timesheets_status ON timesheets(status);
CREATE INDEX idx_payroll_lines_run ON payroll_lines(payrollRunId);

SELECT * FROM payroll_system.employees;
SELECT * FROM payroll_system.timesheets;
SELECT * FROM payroll_system.payroll_runs;
SELECT * FROM payroll_system.payroll_lines;
SELECT * FROM payroll_system.paystubs;

/*Make sure to attach database name.(whatever it is you created) before 
using any queries. Like SELECT, INSERT, etc. If you wanna avoid using the database name, 
you can set it as default using USE command. Just make sure to run it everytime you open
vs code.(Referring to Line 2) */
INSERT INTO payroll_system.employees (fullName, email, hourlyRate) VALUES
('John Doe', 'john.doe@example.com', 25.00);