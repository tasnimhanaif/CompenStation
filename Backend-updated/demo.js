// demo.js
// Demo server using the real algorithms with an in-memory store.
// Run with: node demo.js
// No database needed — great for midterm demos and frontend development.

const express = require("express");
const cors    = require("cors");
const { makeMemoryStore } = require("./Store/storeMemory");
const {
  // Employee
  addEmployee, modifyEmployee, deleteEmployee,
  submitTimesheet, viewMyTimesheets,
  // Benefits
  addBenefit, modifyBenefit, deleteBenefit, getEmployeeBenefits,
  // Deductions
  addDeduction, modifyDeduction, deleteDeduction, getEmployeeDeductions,
  // Admin
  approveTimesheet, rejectTimesheet, runPayroll,
} = require("./algorithms");

const app = express();
app.use(cors());
app.use(express.json());

// Single shared in-memory store for the demo session
const store = makeMemoryStore();

// ================================================================
// AUTH MIDDLEWARE
// Token format (base64-encoded JSON): { id, role }
// role is either "admin" or "employee"
// ================================================================
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Unauthorized" });
  try {
    const token   = header.replace("Bearer ", "");
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf8"));
    req.user = decoded; // { id, role }
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Admins only" });
  next();
}

// ================================================================
// LOGIN
// POST /api/login  { username, role, id }
// Returns a base64 token — pass as:  Authorization: Bearer <token>
//
// Demo tokens (copy/paste into Postman or Thunder Client):
//   Admin  -> { "username": "admin",  "role": "admin",    "id": 0  }
//   Emp 1  -> { "username": "john",   "role": "employee", "id": 1  }
// ================================================================
app.post("/api/login", (req, res) => {
  const { username, role = "employee", id = 1 } = req.body;
  if (!username) return res.status(400).json({ message: "username required" });
  const token = Buffer.from(JSON.stringify({ id, role })).toString("base64");
  res.json({ token, user: { id, username, role } });
});

// ================================================================
// REGISTER
// POST /api/register  { fullName, email, phone, username, password, role, employeeId, jobTitle }
// Returns a token and user object (same as login)
// ================================================================
app.post("/api/register", async (req, res) => {
  try {
    const { fullName, email, phone, username, password, role = "employee", employeeId, jobTitle } = req.body;
    
    // Validation
    if (!fullName || !email || !username || !password) {
      return res.status(400).json({ message: "Missing required fields: fullName, email, username, password" });
    }

    // For demo purposes, we'll create an employee record
    const employeeData = {
      fullName,
      email,
      phone,
      jobTitle: jobTitle || "Employee",
      employeeId: employeeId || `EMP${Date.now()}`,
      isActive: true,
    };

    // Add employee to store (this generates an ID)
    const employee = await addEmployee(store, employeeData);
    
    // Generate token
    const tokenData = { id: employee.id, role };
    const token = Buffer.from(JSON.stringify(tokenData)).toString("base64");
    
    res.status(201).json({ 
      token, 
      user: { 
        id: employee.id, 
        username, 
        role,
        fullName: employee.fullName,
        email: employee.email
      } 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ================================================================
// EMPLOYEE ROUTES  (any authenticated user)
// ================================================================

// POST /api/employee/timesheets/submit
app.post("/api/employee/timesheets/submit", auth, async (req, res) => {
  try {
    const { periodStart, periodEnd, hoursWorked, notes } = req.body;
    const ts = await submitTimesheet(store, { employeeId: req.user.id, periodStart, periodEnd, hoursWorked, notes });
    res.json(ts);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// GET /api/employee/timesheets
app.get("/api/employee/timesheets", auth, async (req, res) => {
  try {
    const timesheets = await viewMyTimesheets(store, req.user.id);
    res.json(timesheets);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// GET /api/employee/paystubs  — view own paystubs
app.get("/api/employee/paystubs", auth, async (req, res) => {
  try {
    const paystubs = await store.listPaystubsByEmployee(req.user.id);
    res.json(paystubs);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// GET /api/employee/benefits  — view own benefits & costs
app.get("/api/employee/benefits", auth, async (req, res) => {
  try {
    const result = await getEmployeeBenefits(store, req.user.id);
    res.json(result);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ================================================================
// ADMIN — EMPLOYEE MANAGEMENT
// ================================================================

// POST /api/admin/employees — add employee
app.post("/api/admin/employees", auth, adminOnly, async (req, res) => {
  try {
    const emp = await addEmployee(store, req.body);
    res.status(201).json(emp);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// GET /api/admin/employees — list all employees
app.get("/api/admin/employees", auth, adminOnly, async (req, res) => {
  try {
    const employees = await store.listEmployees();
    res.json(employees);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// GET /api/admin/employees/:id — get single employee
app.get("/api/admin/employees/:id", auth, adminOnly, async (req, res) => {
  try {
    const emp = await store.getEmployeeById(parseInt(req.params.id));
    if (!emp) return res.status(404).json({ message: "Employee not found" });
    res.json(emp);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT /api/admin/employees/:id — modify employee
// Body: any combination of { fullName, email, phone, address, department, jobTitle, hourlyRate, isActive }
app.put("/api/admin/employees/:id", auth, adminOnly, async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    const emp = await modifyEmployee(store, { employeeId, ...req.body });
    res.json(emp);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE /api/admin/employees/:id — delete employee
// Query param: ?hard=true for permanent deletion, default is soft-delete (isActive=false)
app.delete("/api/admin/employees/:id", auth, adminOnly, async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    const hardDelete = req.query.hard === "true";
    const result = await deleteEmployee(store, { employeeId, hardDelete });
    res.json(result);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ================================================================
// ADMIN — BENEFITS MANAGEMENT
// ================================================================

// POST /api/admin/employees/:id/benefits — add benefit
// Body: { benefitType, planName, employeeCost, employerCost, isEnrolled, effectiveDate, notes }
// benefitType: MEDICAL | DENTAL | VISION | LIFE_INSURANCE | RETIREMENT_401K | OTHER
app.post("/api/admin/employees/:id/benefits", auth, adminOnly, async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    const benefit = await addBenefit(store, { employeeId, ...req.body });
    res.status(201).json(benefit);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// GET /api/admin/employees/:id/benefits — list benefits for employee
app.get("/api/admin/employees/:id/benefits", auth, adminOnly, async (req, res) => {
  try {
    const result = await getEmployeeBenefits(store, parseInt(req.params.id));
    res.json(result);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT /api/admin/benefits/:benefitId — modify a benefit
// Body: any of { planName, employeeCost, employerCost, isEnrolled, effectiveDate, notes }
app.put("/api/admin/benefits/:benefitId", auth, adminOnly, async (req, res) => {
  try {
    const benefitId = parseInt(req.params.benefitId);
    const result = await modifyBenefit(store, { benefitId, ...req.body });
    res.json(result);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE /api/admin/benefits/:benefitId — delete a benefit
app.delete("/api/admin/benefits/:benefitId", auth, adminOnly, async (req, res) => {
  try {
    const benefitId = parseInt(req.params.benefitId);
    const result = await deleteBenefit(store, { benefitId });
    res.json(result);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ================================================================
// ADMIN — TAX & DEDUCTIONS MANAGEMENT
// ================================================================

// POST /api/admin/employees/:id/deductions — add deduction
// Body: { deductionType, label, isPercentage, amount, isActive, notes }
// deductionType: FEDERAL_TAX | STATE_TAX | LOCAL_TAX | SOCIAL_SECURITY | MEDICARE | GARNISHMENT | OTHER
// isPercentage: true = % of gross, false = flat dollar amount
app.post("/api/admin/employees/:id/deductions", auth, adminOnly, async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    const ded = await addDeduction(store, { employeeId, ...req.body });
    res.status(201).json(ded);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// GET /api/admin/employees/:id/deductions — list deductions for employee
app.get("/api/admin/employees/:id/deductions", auth, adminOnly, async (req, res) => {
  try {
    const result = await getEmployeeDeductions(store, parseInt(req.params.id));
    res.json(result);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT /api/admin/deductions/:deductionId — modify a deduction
// Body: any of { label, isPercentage, amount, isActive, notes }
app.put("/api/admin/deductions/:deductionId", auth, adminOnly, async (req, res) => {
  try {
    const deductionId = parseInt(req.params.deductionId);
    const result = await modifyDeduction(store, { deductionId, ...req.body });
    res.json(result);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE /api/admin/deductions/:deductionId — delete a deduction
app.delete("/api/admin/deductions/:deductionId", auth, adminOnly, async (req, res) => {
  try {
    const deductionId = parseInt(req.params.deductionId);
    const result = await deleteDeduction(store, { deductionId });
    res.json(result);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ================================================================
// ADMIN — TIMESHEET MANAGEMENT
// ================================================================

// GET /api/admin/timesheets — list all timesheets (optionally filter by status)
app.get("/api/admin/timesheets", auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const timesheets = status
      ? await store.listTimesheetsByStatus(status.toUpperCase())
      : (await store.listTimesheetsByStatus("DRAFT"))
          .concat(await store.listTimesheetsByStatus("SUBMITTED"))
          .concat(await store.listTimesheetsByStatus("APPROVED"))
          .concat(await store.listTimesheetsByStatus("REJECTED"))
          .concat(await store.listTimesheetsByStatus("PAID"));
    res.json(timesheets);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// POST /api/admin/timesheets/:timesheetId/approve
app.post("/api/admin/timesheets/:timesheetId/approve", auth, adminOnly, async (req, res) => {
  try {
    const timesheetId = parseInt(req.params.timesheetId);
    const ts = await approveTimesheet(store, { timesheetId, reviewedBy: req.user.id });
    res.json(ts);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// POST /api/admin/timesheets/:timesheetId/reject
app.post("/api/admin/timesheets/:timesheetId/reject", auth, adminOnly, async (req, res) => {
  try {
    const timesheetId = parseInt(req.params.timesheetId);
    const { reason } = req.body;
    const ts = await rejectTimesheet(store, { timesheetId, reviewedBy: req.user.id, reason });
    res.json(ts);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ================================================================
// ADMIN — PAYROLL
// ================================================================

// POST /api/admin/payroll/run
// Body: { periodStart, periodEnd }
// Returns: payrollRun summary + per-employee breakdown (gross, deductions, net)
app.post("/api/admin/payroll/run", auth, adminOnly, async (req, res) => {
  try {
    const { periodStart, periodEnd } = req.body;
    const result = await runPayroll(store, { periodStart, periodEnd, executedBy: req.user.id });
    res.json(result);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// GET /api/admin/paystubs — list all paystubs
app.get("/api/admin/paystubs", auth, adminOnly, async (req, res) => {
  try {
    const paystubs = await store.listAllPaystubs();
    res.json(paystubs);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ================================================================
// DEBUG ROUTE (remove before production)
// GET /api/debug/dump — shows entire in-memory store
// ================================================================
app.get("/api/debug/dump", (req, res) => {
  res.json(store._dump());
});

// ================================================================
// START SERVER
// ================================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Demo server running at http://localhost:${PORT}`);
  console.log(`   In-memory store — no database needed. Data resets on restart.\n`);
  console.log("📋 QUICK DEMO STEPS:");
  console.log("   1) POST /api/login             { username, role, id }");
  console.log("   2) POST /api/register          { fullName, email, username, password, role }");
  console.log("   3) POST /api/admin/employees   Add employee");
  console.log("   4) POST /api/admin/employees/:id/benefits   Add medical benefit");
  console.log("   5) POST /api/admin/employees/:id/deductions  Add tax deductions");
  console.log("   6) POST /api/employee/timesheets/submit      Submit timesheet");
  console.log("   7) POST /api/admin/timesheets/:id/approve    Approve timesheet");
  console.log("   8) POST /api/admin/payroll/run               Run payroll (gross→net)\n");
});
