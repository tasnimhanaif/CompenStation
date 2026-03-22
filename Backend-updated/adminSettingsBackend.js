// adminSettingsBackend.js
// Matches: Frontend/js/adminSettings.js
// Handles settings-related API routes for the admin (benefits, state taxes, federal taxes)

const express = require("express");
const router = express.Router();
const store = require("./Store/storeMemory");

// GET /settings/benefits — Get all benefit plans
router.get("/settings/benefits", async (req, res) => {
    try {
          const benefits = await store.listBenefits();
          res.json(benefits);
    } catch (e) {
          res.status(400).json({ error: e.message });
    }
});

// POST /settings/benefits — Add a new benefit plan
router.post("/settings/benefits", async (req, res) => {
    try {
          const benefit = await store.addBenefit(req.body);
          res.json(benefit);
    } catch (e) {
          res.status(400).json({ error: e.message });
    }
});

// DELETE /settings/benefits/:index — Remove a benefit plan
router.delete("/settings/benefits/:index", async (req, res) => {
    try {
          await store.removeBenefit(Number(req.params.index));
          res.json({ success: true });
    } catch (e) {
          res.status(400).json({ error: e.message });
    }
});

// GET /settings/taxes/state — Get all state tax rates
router.get("/settings/taxes/state", async (req, res) => {
    try {
          const taxes = await store.listStateTaxes();
          res.json(taxes);
    } catch (e) {
          res.status(400).json({ error: e.message });
    }
});

// POST /settings/taxes/state — Add a state tax rate
router.post("/settings/taxes/state", async (req, res) => {
    try {
          const tax = await store.addStateTax(req.body);
          res.json(tax);
    } catch (e) {
          res.status(400).json({ error: e.message });
    }
});

// GET /settings/taxes/federal — Get all federal tax rates
router.get("/settings/taxes/federal", async (req, res) => {
    try {
          const taxes = await store.listFederalTaxes();
          res.json(taxes);
    } catch (e) {
          res.status(400).json({ error: e.message });
    }
});

// POST /settings/taxes/federal — Add a federal tax rate
router.post("/settings/taxes/federal", async (req, res) => {
    try {
          const tax = await store.addFederalTax(req.body);
          res.json(tax);
    } catch (e) {
          res.status(400).json({ error: e.message });
    }
});

module.exports = router;
