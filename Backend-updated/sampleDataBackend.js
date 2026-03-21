// sampleDataBackend.js
// Matches: Frontend/js/sampleData.js
// Provides sample/seed data and a seeding route for development and testing

const express = require("express");
const router = express.Router();
const store = require("./Store/storeMemory");

// Sample employee seed data (mirrors the frontend sampleData.js structure)
const sampleEmployees = [
  { fullName: "Alice Johnson", email: "alice@example.com", hourlyRate: 25, jobTitle: "Engineer" },
    { fullName: "Bob Smith", email: "bob@example.com", hourlyRate: 22, jobTitle: "Designer" },
      { fullName: "Carol Williams", email: "carol@example.com", hourlyRate: 30, jobTitle: "Manager" },
      ];

      const sampleBenefits = [
        { name: "Health Insurance", percentage: 5 },
          { name: "Dental", percentage: 2 },
            { name: "Vision", percentage: 1 },
            ];

            const sampleStateTaxes = [5, 6, 7];
            const sampleFederalTaxes = [10, 12, 22];

            // POST /seed — Seed the store with sample data (for development only)
            router.post("/seed", async (req, res) => {
              try {
                  for (const emp of sampleEmployees) {
                        await store.addEmployee(emp);
                            }
                                res.json({ message: "Sample data seeded successfully", employees: sampleEmployees.length });
                                  } catch (e) {
                                      res.status(400).json({ error: e.message });
                                        }
                                        });

                                        // GET /seed/employees — Get the list of sample employees (reference only)
                                        router.get("/seed/employees", (req, res) => {
                                          res.json(sampleEmployees);
                                          });

                                          module.exports = router;
                                          module.exports.sampleEmployees = sampleEmployees;
                                          module.exports.sampleBenefits = sampleBenefits;
                                          module.exports.sampleStateTaxes = sampleStateTaxes;
                                          module.exports.sampleFederalTaxes = sampleFederalTaxes;
