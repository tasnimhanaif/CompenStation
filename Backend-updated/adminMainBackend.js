// adminMainBackend.js
// Matches: Frontend/js/adminMain.js
// Secondary entry point that mounts all admin sub-routers.
// This is imported by server.js — do NOT run this file directly.

const express = require("express");
const router  = express.Router();

// Mount sub-routers under the same base path
router.use("/", require("./adminEmployeesBackend"));
router.use("/", require("./adminDashboardBackend"));
router.use("/", require("./adminSettingsBackend"));

module.exports = router;
