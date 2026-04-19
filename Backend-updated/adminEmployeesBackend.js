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
// FIX: The frontend sends firstName/lastName/pay — map them to fullName/hourlyRate
router.post("/employees", async (req, res) => {
      try {
            const body = req.body;

            // Build fullName from firstName + optional middleName + lastName
            let fullName;
            if (body.firstName || body.lastName) {
                  const parts = [body.firstName, body.middleName, body.lastName]
                        .filter(Boolean)
                        .map(s => s.trim());
                  fullName = parts.join(" ");
            } else {
                  fullName = body.fullName; // allow fullName directly too
            }

            // Map "pay" → "hourlyRate" (frontend sends "pay")
            const hourlyRate = body.hourlyRate ?? body.pay ?? 0;

            // Build normalized payload for the algorithm
            const employeeData = {
                  fullName,
                  email: body.email,
                  hourlyRate,
                  phone: body.phone || null,
                  address: [body.address, body.city, body.state, body.zip]
                        .filter(Boolean).join(", ") || null,
                  department: body.department || null,
                  jobTitle: body.jobTitle || null,
            };

            const emp = await addEmployee(store, employeeData);
            res.json(emp);
      } catch (e) {
            res.status(400).json({ error: e.message });
      }
});

// PATCH /employees/:id — Edit/update an existing employee
router.patch("/employees/:id", async (req, res) => {
      try {
            const body = req.body;

            // Same field mapping for edits
            const patch = { ...body };
            if (body.firstName || body.lastName) {
                  const parts = [body.firstName, body.middleName, body.lastName]
                        .filter(Boolean).map(s => s.trim());
                  patch.fullName = parts.join(" ");
            }
            if (body.pay !== undefined && body.hourlyRate === undefined) {
                  patch.hourlyRate = body.pay;
            }

            const emp = await modifyEmployee(store, {
                  employeeId: Number(req.params.id),
                  ...patch
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
