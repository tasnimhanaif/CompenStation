// employeeBackend.js
// Matches: Frontend/js/employee.js
// Handles all employee-facing API routes (timesheets, benefits enrollment)

const express = require("express");
const router = express.Router();
const store = require("./Store/storeDB");
const { submitTimesheet, approveTimesheet, rejectTimesheet, viewMyTimesheets } = require("./algorithms");

// POST /timesheets — Submit a timesheet
router.post("/timesheets", async (req, res) => {
  try {
      const ts = await submitTimesheet(store, req.body);
          res.json(ts);
            } catch (e) {
                res.status(400).json({ error: e.message });
                  }
                  });

                  // GET /timesheets/status/:status — Get timesheets filtered by status
                  router.get("/timesheets/status/:status", async (req, res) => {
                    try {
                        const rows = await store.listTimesheetsByStatus(req.params.status);
                            res.json(rows);
                              } catch (e) {
                                  res.status(400).json({ error: e.message });
                                    }
                                    });

                                    // GET /timesheets/employee/:id — Get timesheets for a specific employee
                                    router.get("/timesheets/employee/:id", async (req, res) => {
                                      try {
                                          const ts = await viewMyTimesheets(store, Number(req.params.id));
                                              res.json(ts);
                                                } catch (e) {
                                                    res.status(400).json({ error: e.message });
                                                      }
                                                      });

                                                      // PATCH /timesheets/:id/approve — Approve a timesheet
                                                      router.patch("/timesheets/:id/approve", async (req, res) => {
                                                        try {
                                                            const ts = await approveTimesheet(store, { timesheetId: Number(req.params.id), reviewedBy: req.body.reviewedBy });
                                                                res.json(ts);
                                                                  } catch (e) {
                                                                      res.status(400).json({ error: e.message });
                                                                        }
                                                                        });

                                                                        // PATCH /timesheets/:id/reject — Reject a timesheet
                                                                        router.patch("/timesheets/:id/reject", async (req, res) => {
                                                                          try {
                                                                              const ts = await rejectTimesheet(store, { timesheetId: Number(req.params.id), ...req.body });
                                                                                  res.json(ts);
                                                                                    } catch (e) {
                                                                                        res.status(400).json({ error: e.message });
                                                                                          }
                                                                                          });

                                                                                          // POST /api/employee/benefits — Enroll employee in benefit plans
                                                                                          router.post("/api/employee/benefits", async (req, res) => {
                                                                                            try {
                                                                                                const result = await store.enrollBenefits(req.body);
                                                                                                    res.json(result);
                                                                                                      } catch (e) {
                                                                                                          res.status(400).json({ error: e.message });
                                                                                                            }
                                                                                                            });
                                                                                                            
                                                                                                            module.exports = router;
