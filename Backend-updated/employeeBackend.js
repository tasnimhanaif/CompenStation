// employeeBackend.js
// Matches: Frontend/js/employee.js
// Handles all employee-facing API routes (timesheets, benefits enrollment, personal info, paystubs)

const express = require("express");
const router  = express.Router();
const store   = require("./Store/storeDB");   // switched from storeMemory → storeDB
const { submitTimesheet, approveTimesheet, rejectTimesheet, viewMyTimesheets } = require("./algorithms");

// ─── Timesheets ───────────────────────────────────────────────────────────────

// POST /timesheets — Submit a new timesheet (current pay period info)
// Body: { employeeId, periodStart, periodEnd, hoursWorked, notes }
// API contract: current pay period info display (hours worked, gross pay, deductions, net pay)
router.post("/timesheets", async (req, res) => {
    try {
        const ts = await submitTimesheet(store, req.body);
        res.json(ts);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// GET /timesheets/status/:status — Get timesheets filtered by status
// Status values: DRAFT | SUBMITTED | APPROVED | REJECTED | PAID
// API contract: OPTIONAL: administrative actions: timesheet approved or not approved
router.get("/timesheets/status/:status", async (req, res) => {
    try {
        const rows = await store.listTimesheetsByStatus(req.params.status);
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /timesheets/employee/:id — Get all timesheets for a specific employee
// API contract: request time off / personal information display
router.get("/timesheets/employee/:id", async (req, res) => {
    try {
        const ts = await viewMyTimesheets(store, Number(req.params.id));
        res.json(ts);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// PATCH /timesheets/:id/approve — Approve a timesheet
// Body: { reviewedBy }
// API contract: OPTIONAL: administrative actions: timesheet approved or not approved
router.patch("/timesheets/:id/approve", async (req, res) => {
    try {
        const ts = await approveTimesheet(store, {
            timesheetId: Number(req.params.id),
            reviewedBy:  req.body.reviewedBy
        });
        res.json(ts);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// PATCH /timesheets/:id/reject — Reject a timesheet
// Body: { reviewedBy, rejectionReason }
router.patch("/timesheets/:id/reject", async (req, res) => {
    try {
        const ts = await rejectTimesheet(store, {
            timesheetId: Number(req.params.id),
            ...req.body
        });
        res.json(ts);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// ─── Personal info ────────────────────────────────────────────────────────────

// GET /employee/:id — Get a single employee's personal info
// API contract: personal information display
router.get("/employee/:id", async (req, res) => {
    try {
        const emp = await store.getEmployeeById(Number(req.params.id));
        if (!emp) return res.status(404).json({ error: "Employee not found" });
        res.json(emp);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// PATCH /employee/:id — Update personal info (employee self-service)
// Body: any subset of employee fields (phone, address, city, state, zip, email, etc.)
// API contract: update personal info
router.patch("/employee/:id", async (req, res) => {
    try {
        // Restrict which fields an employee can self-update (no salary, role, ssn changes)
        const allowed = ["phone", "address", "city", "state", "zip", "email"];
        const patch   = {};
        for (const key of allowed) {
            if (req.body[key] !== undefined) patch[key] = req.body[key];
        }
        const emp = await store.updateEmployee(Number(req.params.id), patch);
        res.json(emp);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// ─── Benefits (employee self-service) ────────────────────────────────────────

// GET /employee/:id/benefits — Get enrolled benefits for an employee
// API contract: manage benefits
router.get("/employee/:id/benefits", async (req, res) => {
    try {
        const benefits = await store.listBenefitsByEmployee(Number(req.params.id));
        res.json(benefits);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /employee/benefits — Enroll employee in benefit plans
// Body: { planIds: [...] }
// API contract: manage benefits
router.post("/employee/benefits", async (req, res) => {
    try {
        const result = await store.enrollBenefits(req.body);
        res.json(result);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// ─── Paystubs (employee self-service) ────────────────────────────────────────

// GET /employee/:id/paystubs — Download/view paystubs for an employee
// API contract: download paystub/check, Pay History
router.get("/employee/:id/paystubs", async (req, res) => {
    try {
        const paystubs = await store.listPaystubsByEmployee(Number(req.params.id));
        res.json(paystubs);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
