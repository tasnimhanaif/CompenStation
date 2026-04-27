// adminEmployeesBackend.js
// Matches: Frontend/js/adminEmployees.js
// Handles all employee-related API routes for the admin (list, search, add, edit, delete)

const express = require("express");
const router  = express.Router();
const store   = require("./Store/storeDB");   // switched from storeMemory → storeDB
const { addEmployee, modifyEmployee, deleteEmployee } = require("./algorithms");

// GET /employees — List all employees
router.get("/employees", async (req, res) => {
    try {
        const employees = await store.listEmployees();
        res.json(employees);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /employees/search?name=... — Search employees by name (API contract: return employee with matching name)
router.get("/employees/search", async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) return res.status(400).json({ error: "Query param 'name' is required" });
        const results = await store.searchEmployeesByName(name);
        res.json(results);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /employees/:id — Get a single employee by ID
router.get("/employees/:id", async (req, res) => {
    try {
        const emp = await store.getEmployeeById(Number(req.params.id));
        if (!emp) return res.status(404).json({ error: "Employee not found" });
        res.json(emp);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /employees — Add a new employee
// Body fields (API contract): firstName, middleName, lastName, birthdate, sex,
//   employeeCode, employmentType, payType, hourlyRate, email, phone,
//   address, city, state, zip, ssn, department, jobTitle, currentStatus, companyId
router.post("/employees", async (req, res) => {
    try {
        const emp = await addEmployee(store, req.body);
        res.json(emp);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// PATCH /employees/:id — Edit/update an existing employee
router.patch("/employees/:id", async (req, res) => {
    try {
        const emp = await modifyEmployee(store, {
            employeeId: Number(req.params.id),
            ...req.body
        });
        res.json(emp);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// DELETE /employees/:id — Delete an employee
// Pass ?hard=true for permanent delete; default is soft-delete (sets isActive=false, currentStatus='terminated')
router.delete("/employees/:id", async (req, res) => {
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

module.exports = router;
