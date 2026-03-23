// Backend/backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const store = require("./Store/storeMemory");
const {
    addEmployee, modifyEmployee, deleteEmployee,
    submitTimesheet, approveTimesheet, rejectTimesheet,
    runPayroll, viewMyTimesheets
} = require("./algorithms");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// --- Employees ---
app.get("/employees", async (req, res) => {
    const employees = await store.listEmployees();
    res.json(employees);
});

app.post("/employees", async (req, res) => {
    try {
          const emp = await addEmployee(store, req.body);
          res.json(emp);
    } catch (e) {
          res.status(400).json({ error: e.message });
    }
});

app.patch("/employees/:id", async (req, res) => {
    try {
          const emp = await modifyEmployee(store, { employeeId: Number(req.params.id), ...req.body });
          res.json(emp);
    } catch (e) {
          res.status(400).json({ error: e.message });
    }
});

app.delete("/employees/:id", async (req, res) => {
    try {
          const result = await deleteEmployee(store, {
                  employeeId: Number(req.params.id),
                  hardDelete: req.query.hard === "true"
          });
          res.json(result);
    } catch (e) {
          res.status(400).json({ error: e.message });
    }
});

// --- Timesheets ---
app.post("/timesheets", async (req, res) => {
    try {
          const ts = await submitTimesheet(store, req.body);
          res.json(ts);
    } catch (e) {
          res.status(400).json({ error: e.message });
    }
});

app.get("/timesheets/status/:status", async (req, res) => {
    try {
          const rows = await store.listTimesheetsByStatus(req.params.status);
          res.json(rows);
    } catch (e) {
          res.status(400).json({ error: e.message });
    }
});

app.get("/timesheets/employee/:id", async (req, res) => {
    try {
          const ts = await viewMyTimesheets(store, Number(req.params.id));
          res.json(ts);
    } catch (e) {
          res.status(400).json({ error: e.message });
    }
});

app.patch("/timesheets/:id/approve", async (req, res) => {
    try {
          const ts = await approveTimesheet(store, {
                  timesheetId: Number(req.params.id),
                  reviewedBy: req.body.reviewedBy
          });
          res.json(ts);
    } catch (e) {
          res.status(400).json({ error: e.message });
    }
});

app.patch("/timesheets/:id/reject", async (req, res) => {
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

// --- Payroll ---
app.post("/payroll/run", async (req, res) => {
    try {
          const result = await runPayroll(store, req.body);
          res.json(result);
    } catch (e) {
          res.status(400).json({ error: e.message });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
