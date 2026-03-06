// demo.js
// Lightweight demo server using the real algorithms with an in-memory store.
// Run with: node demo.js
// No database needed — great for frontend development and testing.

const express = require("express");
const cors = require("cors");
const { makeMemoryStore } = require("./Store/storeMemory");
const {
  submitTimesheet,
  viewMyTimesheets,
  addEmployee,
  approveTimesheet,
  rejectTimesheet,
  runPayroll,
} = require("./algorithms");

const app = express();
app.use(cors());
app.use(express.json());

// Single shared in-memory store for the demo session
const store = makeMemoryStore();

// ===== Mock Auth Middleware =====
// In demo mode, we trust whatever employeeId/role is passed in the token.
// Token format (base64-encoded JSON): { id, role }
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Unauthorized" });

  try {
    const token = header.replace("Bearer ", "");
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

// ===== Login =====
// Returns a base64 token encoding { id, role }.
// For demo: pass { username, role, id } in the request body.
app.post("/api/login", (req, res) => {
  const { username, role = "employee", id = 1 } = req.body;
  if (!username) return res.status(400).json({ message: "username required" });

  const token = Buffer.from(JSON.stringify({ id, role })).toString("base64");
  res.json({ token, user: { id, username, role } });
});

// ===== Employee Routes =====

// Submit a timesheet
app.post("/api/employee/timesheets/submit", auth, async (req, res) => {
  try {
    const { periodStart, periodEnd, hoursWorked, notes } = req.body;
    const employeeId = req.user.id;
    const ts = await submitTimesheet(store, { employeeId, periodStart, periodEnd, hoursWorked, notes });
    res.json(ts);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// View my timesheets
app.get("/api/employee/timesheets", auth, async (req, res) => {
  try {
    const timesheets = await viewMyTimesheets(store, req.user.id);
    res.json(timesheets);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ===== Admin Routes =====

// Add an employee
app.post("/api/admin/employees", auth, adminOnly, async (req, res) => {
  try {
    const emp = await addEmployee(store, req.body);
    res.json(emp);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// List all employees
app.get("/api/admin/employees", auth, adminOnly, async (req, res) => {
  try {
    const employees = await store.listEmployees();
    res.json(employees);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Approve a timesheet
app.post("/api/admin/timesheets/:timesheetId/approve", auth, adminOnly, async (req, res) => {
  try {
    const timesheetId = parseInt(req.params.timesheetId);
    const ts = await approveTimesheet(store, { timesheetId, reviewedBy: req.user.id });
    res.json(ts);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Reject a timesheet
app.post("/api/admin/timesheets/:timesheetId/reject", auth, adminOnly, async (req, res) => {
  try {
    const timesheetId = parseInt(req.params.timesheetId);
    const { reason } = req.body;
    const ts = await rejectTimesheet(store, { timesheetId, reviewedBy: req.user.id, reason });
    res.json(ts);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Run payroll
app.post("/api/admin/payroll/run", auth, adminOnly, async (req, res) => {
  try {
    const { periodStart, periodEnd } = req.body;
    const result = await runPayroll(store, { periodStart, periodEnd, executedBy: req.user.id });
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ===== Start Server =====
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Demo server running at http://localhost:${PORT}`);
  console.log(`   Uses in-memory store — no database needed.`);
  console.log(`   Data resets on restart.`);
});
