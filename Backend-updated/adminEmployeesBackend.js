// adminEmployeesBackend.js
// Matches: Frontend/js/adminEmployees.js
// Handles all employee-related API routes for the admin (list, add)

const express = require("express");
const router = express.Router();
const store = require("./Store/storeMemory");
const { addEmployee } = require("./algorithms");

// GET /employees — List all employees
router.get("/employees", async (req, res) => {
    const employees = await store.listEmployees();
    res.json(employees);
});

// POST /employees — Add a new employee
router.post("/employees", async (req, res) => {
    try {
          const emp = await addEmployee(store, req.body);
          res.json(emp);
    } catch (e) {
          res.status(400).json({ error: e.message });
    }
});

module.exports = router;
