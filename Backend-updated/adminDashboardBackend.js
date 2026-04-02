// adminDashboardBackend.js
// Matches: Frontend/js/adminDashboard.js
// Handles payroll-related API routes for the admin dashboard (run payroll)

const express = require("express");
const router = express.Router();
const store = require("./Store/storeMemory");
const { runPayroll } = require("./algorithms");

// POST /payroll/run — Run payroll for all employees
router.post("/payroll/run", async (req, res) => {
    try {
          const result = await runPayroll(store, req.body);
          res.json(result);
    } catch (e) {
          res.status(400).json({ error: e.message });
    }
});

module.exports = router;
