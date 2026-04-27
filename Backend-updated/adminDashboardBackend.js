// adminDashboardBackend.js
// Matches: Frontend/js/adminDashboard.js
// Handles payroll and dashboard API routes for the admin section

const express = require("express");
const router  = express.Router();
const store   = require("./Store/storeDB");   // switched from storeMemory → storeDB
const { runPayroll } = require("./algorithms");

// GET /dashboard/summary — Return total employees + total pay for a pay period
// Query params: periodStart, periodEnd (ISO date strings, optional)
// API contract: return total employees, return total pay for pay period
router.get("/dashboard/summary", async (req, res) => {
    try {
        const summary = await store.getDashboardSummary({
            periodStart: req.query.periodStart,
            periodEnd:   req.query.periodEnd
        });
        res.json(summary);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /payroll/runs — Return payroll run history
// API contract: return payroll run data to show in payroll history
router.get("/payroll/runs", async (req, res) => {
    try {
        const runs = await store.listPayrollRuns();
        res.json(runs);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /payroll/run — Run payroll for all employees
// Body: { periodStart, periodEnd, executedBy }
// API contract: save payroll run data
router.post("/payroll/run", async (req, res) => {
    try {
        const result = await runPayroll(store, req.body);
        res.json(result);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// GET /paystubs — Return all paystubs (check history)
// API contract: Pay History (every time they were part of a payroll run)
router.get("/paystubs", async (req, res) => {
    try {
        const paystubs = await store.listAllPaystubs();
        res.json(paystubs);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /paystubs/employee/:id — Return paystubs for a specific employee
router.get("/paystubs/employee/:id", async (req, res) => {
    try {
        const paystubs = await store.listPaystubsByEmployee(Number(req.params.id));
        res.json(paystubs);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
