// adminMainBackend.js
// Matches: Frontend/js/adminMain.js
// Main server entry point — sets up Express, middleware, and mounts all route modules
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const adminEmployeesRouter = require("./adminEmployeesBackend");
const adminDashboardRouter = require("./adminDashboardBackend");
const adminSettingsRouter = require("./adminSettingsBackend");
const employeeRouter = require("./employeeBackend");
const loginRouter = require("./loginBackend");
const indexRouter = require("./indexBackend");

const app = express();
app.use(cors());
app.use(express.json());

// Mount route modules
app.use("/", indexRouter);
app.use("/", loginRouter);
app.use("/", adminEmployeesRouter);
app.use("/", adminDashboardRouter);
app.use("/", adminSettingsRouter);
app.use("/", employeeRouter);

const PORT = process.env.PORT || 5000; // Default to 5000 if not in .env

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});