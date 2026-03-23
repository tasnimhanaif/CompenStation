// adminEmployeesBackend.js
// Matches: Frontend/js/adminEmployees.js
// Handles all employee-related API routes for the admin (list, add, edit, delete)
const express = require("express");
const router = express.Router();
const store = require("./Store/storeMemory");
const { addEmployee, modifyEmployee, deleteEmployee } = require("./algorithms");

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

// DELETE /employees/:id — Delete an employee (soft by default, hard if ?hard=true)
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
