// sampleDataBackend.js
// Matches: Frontend/js/sampleData.js
// Provides sample/seed data and a seeding route for development and testing

const express = require("express");
const router  = express.Router();
const store   = require("./Store/storeDB");   // switched from storeMemory → storeDB

// Sample employees now include all API contract fields:
// firstName, middleName (opt), lastName, birthdate, sex, employeeCode,
// employmentType, payType, hourlyRate, email, phone,
// address, city, state, zip, department, jobTitle, currentStatus
const sampleEmployees = [
    {
        firstName: "Alice", lastName: "Johnson",
        employeeCode: "00000001", birthdate: "1990-03-15", sex: "F",
        employmentType: "full-time", payType: "hourly", hourlyRate: 25,
        email: "alice@example.com", phone: "718-555-0101",
        address: "100 Main St", city: "Staten Island", state: "NY", zip: "10301",
        department: "Engineering", jobTitle: "Engineer", currentStatus: "active"
    },
    {
        firstName: "Bob", lastName: "Smith",
        employeeCode: "00000002", birthdate: "1985-07-22", sex: "M",
        employmentType: "full-time", payType: "hourly", hourlyRate: 22,
        email: "bob@example.com", phone: "718-555-0102",
        address: "200 Broadway", city: "Staten Island", state: "NY", zip: "10310",
        department: "Design", jobTitle: "Designer", currentStatus: "active"
    },
    {
        firstName: "Carol", lastName: "Williams",
        employeeCode: "00000003", birthdate: "1978-11-05", sex: "F",
        employmentType: "full-time", payType: "salary", hourlyRate: 30,
        email: "carol@example.com", phone: "718-555-0103",
        address: "300 Forest Ave", city: "Staten Island", state: "NY", zip: "10314",
        department: "Management", jobTitle: "Manager", currentStatus: "active"
    },
];

const sampleBenefits = [
    { name: "Health Insurance", percentage: 5 },
    { name: "Dental",           percentage: 2 },
    { name: "Vision",           percentage: 1 },
];

// Unified tax seed data (API contract: type + percentage)
const sampleTaxes = [
    { type: "state",   percentage: 6.85 },   // NY state income tax (example bracket)
    { type: "federal", percentage: 22  },    // Federal income tax (example bracket)
    { type: "federal", percentage: 12  },
];

// POST /seed — Seed the store with sample data (development only)
router.post("/seed", async (req, res) => {
    try {
        const created = [];
        for (const emp of sampleEmployees) {
            const e = await store.createEmployee(emp);
            created.push(e);
        }
        for (const b of sampleBenefits) {
            await store.addBenefit(b);
        }
        for (const t of sampleTaxes) {
            await store.addTax(t);
        }
        res.json({
            message:   "Sample data seeded successfully",
            employees: created.length,
            benefits:  sampleBenefits.length,
            taxes:     sampleTaxes.length,
        });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// GET /seed/employees — Return the sample employee list (reference only)
router.get("/seed/employees", (req, res) => {
    res.json(sampleEmployees);
});

module.exports = router;
module.exports.sampleEmployees = sampleEmployees;
module.exports.sampleBenefits  = sampleBenefits;
module.exports.sampleTaxes     = sampleTaxes;
