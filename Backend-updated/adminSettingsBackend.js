// adminSettingsBackend.js
// Matches: Frontend/js/adminSettings.js
// Handles settings API routes: benefits catalog and taxes (unified + legacy)

const express = require("express");
const router  = express.Router();
const store   = require("./Store/storeDB");   // switched from storeMemory → storeDB

// ─── Benefits catalog ─────────────────────────────────────────────────────────

// GET /settings/benefits — Return list of benefit plans
// API contract: return list of benefits
router.get("/settings/benefits", async (req, res) => {
    try {
        res.json(await store.listBenefits());
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /settings/benefits — Add a new benefit plan
// Body: { name, percentage }
// API contract: add benefit
router.post("/settings/benefits", async (req, res) => {
    try {
        res.json(await store.addBenefit(req.body));
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// PATCH /settings/benefits/:id — Modify an existing benefit plan
// Body: { name?, percentage? }
// API contract: modify benefit
router.patch("/settings/benefits/:id", async (req, res) => {
    try {
        const updated = await store.updateBenefit(Number(req.params.id), req.body);
        if (!updated) return res.status(404).json({ error: "Benefit not found" });
        res.json(updated);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// DELETE /settings/benefits/:index — Remove a benefit plan by list index
// API contract: delete benefit
router.delete("/settings/benefits/:index", async (req, res) => {
    try {
        await store.removeBenefit(Number(req.params.index));
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// ─── Taxes (unified — API contract: tax_ID, Type, Percentage) ─────────────────

// GET /settings/taxes — Return all taxes (optionally filtered by ?type=state|federal)
// API contract: return list of state taxes / return list of federal taxes
router.get("/settings/taxes", async (req, res) => {
    try {
        res.json(await store.listTaxes(req.query.type));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /settings/taxes — Add a tax entry
// Body: { type: 'state'|'federal', percentage }
// API contract: add tax
router.post("/settings/taxes", async (req, res) => {
    try {
        res.json(await store.addTax(req.body));
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// PATCH /settings/taxes/:id — Modify a tax entry
// Body: { percentage }
// API contract: modify tax
router.patch("/settings/taxes/:id", async (req, res) => {
    try {
        const updated = await store.updateTax(Number(req.params.id), req.body);
        if (!updated) return res.status(404).json({ error: "Tax not found" });
        res.json(updated);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// DELETE /settings/taxes/:id — Remove a tax entry
// API contract: delete tax
router.delete("/settings/taxes/:id", async (req, res) => {
    try {
        await store.deleteTax(Number(req.params.id));
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// ─── Legacy separate tax routes (kept for any existing frontend calls) ─────────

// GET /settings/taxes/state
router.get("/settings/taxes/state", async (req, res) => {
    try { res.json(await store.listStateTaxes()); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /settings/taxes/state
router.post("/settings/taxes/state", async (req, res) => {
    try { res.json(await store.addStateTax(req.body)); }
    catch (e) { res.status(400).json({ error: e.message }); }
});

// GET /settings/taxes/federal
router.get("/settings/taxes/federal", async (req, res) => {
    try { res.json(await store.listFederalTaxes()); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /settings/taxes/federal
router.post("/settings/taxes/federal", async (req, res) => {
    try { res.json(await store.addFederalTax(req.body)); }
    catch (e) { res.status(400).json({ error: e.message }); }
});

module.exports = router;
