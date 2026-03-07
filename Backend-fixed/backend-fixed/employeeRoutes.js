// employeeRoutes.js
// API routes for the employee-facing frontend (Tasnim's dashboard)
// Mount this in your main server file: app.use("/api", employeeRoutes);

const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("./Store/db");

const router = express.Router();

// ─── Middleware: verify JWT token ───────────────────────────────────────────
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1]; // "Bearer <token>"
  if (!token) return res.status(401).json({ error: "Malformed token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.employeeId = decoded.employeeId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ─── POST /api/auth/login ────────────────────────────────────────────────────
// Body: { email, password }
// Returns: { token }
// Note: employees table has no password column yet — see comment below
router.post("/auth/login", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const [rows] = await pool.execute(
      "SELECT * FROM employees WHERE email = ? AND isActive = TRUE",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Employee not found or inactive" });
    }

    const employee = rows[0];

    // TODO: add password hashing (bcrypt) once a password column is added to employees table
    // For now, login is email-only for demo purposes

    const token = jwt.sign(
      { employeeId: employee.id },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── GET /api/employee/profile ───────────────────────────────────────────────
// Returns: { id, fullName, email, phone, address, hourlyRate }
router.get("/employee/profile", authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, fullName, email, hourlyRate FROM employees WHERE id = ?",
      [req.employeeId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Profile error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── GET /api/employee/timesheets ────────────────────────────────────────────
// Returns: array of timesheets for the logged-in employee
router.get("/employee/timesheets", authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM timesheets WHERE employeeId = ? ORDER BY createdAt DESC",
      [req.employeeId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Timesheets error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
