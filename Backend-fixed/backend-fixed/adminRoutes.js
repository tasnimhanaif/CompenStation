// adminRoutes.js
// API routes for Jason's admin frontend + employee timesheet submission
// Mount this in your main server file: app.use("/api", adminRoutes);

const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("./Store/db");
const { submitTimesheet, approveTimesheet } = require("./algorithms");

const router = express.Router();

// ─── Middleware: verify JWT token ────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Malformed token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.employeeId = decoded.employeeId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ─── Store adapter: wraps MySQL pool to match the store interface ─────────────
// algorithms.js expects a store object with specific methods — this bridges the gap
const dbStore = {
  async getEmployeeById(id) {
    const [rows] = await pool.execute("SELECT * FROM employees WHERE id = ?", [id]);
    return rows[0] || null;
  },
  async getTimesheetById(id) {
    const [rows] = await pool.execute("SELECT * FROM timesheets WHERE id = ?", [id]);
    return rows[0] || null;
  },
  async listTimesheetsByEmployee(employeeId) {
    const [rows] = await pool.execute(
      "SELECT * FROM timesheets WHERE employeeId = ? ORDER BY createdAt DESC",
      [employeeId]
    );
    return rows;
  },
  async createTimesheet({ employeeId, periodStart, periodEnd, hoursWorked, notes }) {
    const [result] = await pool.execute(
      "INSERT INTO timesheets (employeeId, periodStart, periodEnd, hoursWorked, notes) VALUES (?, ?, ?, ?, ?)",
      [employeeId, periodStart, periodEnd, hoursWorked, notes]
    );
    return { id: result.insertId, employeeId, periodStart, periodEnd, hoursWorked, notes, status: "DRAFT" };
  },
  async updateTimesheet(id, patch) {
    const fields = Object.keys(patch).map(k => `${k} = ?`).join(", ");
    const values = [...Object.values(patch), id];
    await pool.execute(`UPDATE timesheets SET ${fields} WHERE id = ?`, values);
    return dbStore.getTimesheetById(id);
  },
};

// ─── POST /api/employee/timesheets/submit ─────────────────────────────────────
// Body: { periodStart, periodEnd, hoursWorked, notes }
// Returns: the created + submitted timesheet
router.post("/employee/timesheets/submit", authMiddleware, async (req, res) => {
  const { periodStart, periodEnd, hoursWorked, notes } = req.body;

  if (!periodStart || !periodEnd || !hoursWorked) {
    return res.status(400).json({ error: "periodStart, periodEnd, and hoursWorked are required" });
  }

  try {
    const timesheet = await submitTimesheet(dbStore, {
      employeeId: req.employeeId,
      periodStart,
      periodEnd,
      hoursWorked,
      notes,
    });
    res.json(timesheet);
  } catch (err) {
    console.error("Submit timesheet error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// ─── POST /api/admin/timesheets/:id/approve ───────────────────────────────────
// Returns: the updated timesheet with APPROVED status
router.post("/admin/timesheets/:id/approve", authMiddleware, async (req, res) => {
  const timesheetId = Number(req.params.id);

  try {
    const timesheet = await approveTimesheet(dbStore, {
      timesheetId,
      reviewedBy: req.employeeId,
    });
    res.json(timesheet);
  } catch (err) {
    console.error("Approve timesheet error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
