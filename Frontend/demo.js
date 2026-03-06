// demo.js
// Run with: node demo.js

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let timesheets = [];
let idCounter = 1;

// ===== Mock Auth Middleware =====
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// ===== Login (for demo) =====
app.post("/api/login", (req, res) => {
  const { username } = req.body;
  // Always return a fake token
  res.json({ token: "demo-token", user: { username, role: "employee" } });
});

// ===== Submit Timesheet =====
app.post("/api/employee/timesheets/submit", auth, (req, res) => {
  const { periodStart, periodEnd, hoursWorked, notes } = req.body;

  const timesheet = {
    id: idCounter++,
    periodStart,
    periodEnd,
    hoursWorked,
    notes,
    status: "SUBMITTED",
    submittedAt: new Date(),
  };

  timesheets.push(timesheet);
  res.json(timesheet);
});

// ===== View My Timesheets =====
app.get("/api/employee/timesheets", auth, (req, res) => {
  res.json(timesheets);
});

// ===== Approve Timesheet =====
app.post("/api/admin/timesheets/:id/approve", auth, (req, res) => {
  const id = parseInt(req.params.id);
  const ts = timesheets.find(t => t.id === id);

  if (!ts) {
    return res.status(404).json({ message: "Timesheet not found" });
  }

  ts.status = "APPROVED";
  ts.reviewedAt = new Date();

  res.json(ts);
});

// ===== Start Server =====
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Demo backend running at http://localhost:${PORT}`);
});