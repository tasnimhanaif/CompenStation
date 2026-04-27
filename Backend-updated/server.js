// server.js
// Main entry point — sets up Express, middleware, and mounts all route modules.
// Run with: node server.js

require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ── Route modules ────────────────────────────────────────────────────────────
app.use("/", require("./indexBackend"));
app.use("/", require("./loginBackend"));
app.use("/", require("./adminEmployeesBackend"));
app.use("/", require("./adminDashboardBackend"));
app.use("/", require("./adminSettingsBackend"));
app.use("/", require("./employeeBackend"));

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`CompenStation server running on http://localhost:${PORT}`);
});
// server.js
// Main entry point — sets up Express, middleware, and mounts all route modules.
// Run with: node server.js

require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ── Route modules ────────────────────────────────────────────────────────────
app.use("/", require("./indexBackend"));
app.use("/", require("./loginBackend"));
app.use("/", require("./adminEmployeesBackend"));
app.use("/", require("./adminDashboardBackend"));
app.use("/", require("./adminSettingsBackend"));
app.use("/", require("./employeeBackend"));

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`CompenStation server running on http://localhost:${PORT}`);
});
