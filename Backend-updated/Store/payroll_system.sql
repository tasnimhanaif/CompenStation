CREATE DATABASE IF NOT EXISTS payroll_system;
USE payroll_system;

-- ============================================================
-- EMPLOYEES
-- ============================================================
CREATE TABLE employees (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    fullName     VARCHAR(255)        NOT NULL,
    email        VARCHAR(255)        NOT NULL UNIQUE,
    phone        VARCHAR(30)         DEFAULT NULL,
    address      VARCHAR(500)        DEFAULT NULL,
    department   VARCHAR(100)        DEFAULT NULL,
    jobTitle     VARCHAR(100)        DEFAULT NULL,
    hourlyRate   DECIMAL(10,2)       NOT NULL DEFAULT 0.00,
    isActive     BOOLEAN             DEFAULT TRUE,
    createdAt    TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    updatedAt    TIMESTAMP           DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- BENEFITS  (medical, dental, vision, 401k, etc.)
-- ============================================================
CREATE TABLE benefits (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    employeeId      INT             NOT NULL,
    benefitType     ENUM('MEDICAL','DENTAL','VISION','LIFE_INSURANCE','RETIREMENT_401K','OTHER') NOT NULL,
    planName        VARCHAR(255)    DEFAULT NULL,
    employeeCost    DECIMAL(10,2)   NOT NULL DEFAULT 0.00,   -- per pay period deduction from employee
    employerCost    DECIMAL(10,2)   NOT NULL DEFAULT 0.00,   -- employer contribution
    isEnrolled      BOOLEAN         DEFAULT TRUE,
    effectiveDate   DATE            DEFAULT NULL,
    notes           TEXT            DEFAULT NULL,
    createdAt       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updatedAt       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

-- ============================================================
-- TAX & OTHER DEDUCTIONS
-- ============================================================
CREATE TABLE deductions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    employeeId      INT             NOT NULL,
    deductionType   ENUM('FEDERAL_TAX','STATE_TAX','LOCAL_TAX','SOCIAL_SECURITY','MEDICARE','GARNISHMENT','OTHER') NOT NULL,
    label           VARCHAR(255)    DEFAULT NULL,           -- e.g. "CA State Tax"
    isPercentage    BOOLEAN         DEFAULT TRUE,           -- TRUE = % of gross, FALSE = flat dollar amount
    amount          DECIMAL(10,4)   NOT NULL DEFAULT 0.00,  -- % (e.g. 6.20) or flat $
    isActive        BOOLEAN         DEFAULT TRUE,
    notes           TEXT            DEFAULT NULL,
    createdAt       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updatedAt       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

-- ============================================================
-- TIMESHEETS
-- ============================================================
CREATE TABLE timesheets (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    employeeId      INT             NOT NULL,
    periodStart     DATETIME        NOT NULL,
    periodEnd       DATETIME        NOT NULL,
    hoursWorked     DECIMAL(6,2)    NOT NULL,
    notes           TEXT,
    status          ENUM('DRAFT','SUBMITTED','APPROVED','REJECTED','PAID') DEFAULT 'DRAFT',
    submittedAt     DATETIME        NULL,
    reviewedAt      DATETIME        NULL,
    reviewedBy      VARCHAR(255)    NULL,
    rejectionReason TEXT            NULL,
    paidAt          DATETIME        NULL,
    createdAt       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

-- ============================================================
-- PAYROLL RUNS
-- ============================================================
CREATE TABLE payroll_runs (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    periodStart     DATETIME        NOT NULL,
    periodEnd       DATETIME        NOT NULL,
    executedBy      VARCHAR(255),
    totalGross      DECIMAL(12,2)   NOT NULL,
    totalDeductions DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    totalNet        DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    createdAt       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PAYROLL LINES  (one per employee per run)
-- ============================================================
CREATE TABLE payroll_lines (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    payrollRunId    INT             NOT NULL,
    employeeId      INT             NOT NULL,
    timesheetId     INT             NOT NULL,
    grossPay        DECIMAL(10,2)   NOT NULL,
    totalDeductions DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    netPay          DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    createdAt       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (payrollRunId) REFERENCES payroll_runs(id) ON DELETE CASCADE,
    FOREIGN KEY (employeeId)   REFERENCES employees(id),
    FOREIGN KEY (timesheetId)  REFERENCES timesheets(id)
);

-- ============================================================
-- PAYSTUBS
-- ============================================================
CREATE TABLE paystubs (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    employeeId      INT             NOT NULL,
    payrollRunId    INT             NOT NULL,
    grossPay        DECIMAL(10,2)   NOT NULL,
    totalDeductions DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    netPay          DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    createdAt       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (employeeId)   REFERENCES employees(id),
    FOREIGN KEY (payrollRunId) REFERENCES payroll_runs(id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_timesheets_employee  ON timesheets(employeeId);
CREATE INDEX idx_timesheets_status    ON timesheets(status);
CREATE INDEX idx_payroll_lines_run    ON payroll_lines(payrollRunId);
CREATE INDEX idx_benefits_employee    ON benefits(employeeId);
CREATE INDEX idx_deductions_employee  ON deductions(employeeId);

-- ============================================================
-- SAMPLE SEED DATA
-- ============================================================
INSERT INTO employees (fullName, email, phone, address, department, jobTitle, hourlyRate) VALUES
('John Doe',   'john.doe@example.com',   '555-1001', '123 Main St, Springfield', 'Engineering', 'Software Developer', 35.00),
('Jane Smith', 'jane.smith@example.com', '555-1002', '456 Oak Ave, Shelbyville', 'HR',          'HR Coordinator',     28.00);

-- Medical benefit for John (enrolled)
INSERT INTO benefits (employeeId, benefitType, planName, employeeCost, employerCost, isEnrolled) VALUES
(1, 'MEDICAL',        'Blue Cross PPO',  150.00, 400.00, TRUE),
(1, 'DENTAL',         'Delta Dental',     15.00,  30.00, TRUE),
(1, 'RETIREMENT_401K','401k Plan',        50.00,  50.00, TRUE),
(2, 'MEDICAL',        'Blue Cross HMO',  100.00, 350.00, TRUE);

-- Deductions for John
INSERT INTO deductions (employeeId, deductionType, label, isPercentage, amount, isActive) VALUES
(1, 'FEDERAL_TAX',     'Federal Income Tax', TRUE,  12.00, TRUE),
(1, 'STATE_TAX',       'State Income Tax',   TRUE,   5.00, TRUE),
(1, 'SOCIAL_SECURITY', 'Social Security',    TRUE,   6.20, TRUE),
(1, 'MEDICARE',        'Medicare',           TRUE,   1.45, TRUE),
(2, 'FEDERAL_TAX',     'Federal Income Tax', TRUE,  10.00, TRUE),
(2, 'SOCIAL_SECURITY', 'Social Security',    TRUE,   6.20, TRUE),
(2, 'MEDICARE',        'Medicare',           TRUE,   1.45, TRUE);
