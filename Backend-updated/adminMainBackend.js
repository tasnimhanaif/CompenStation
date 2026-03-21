// adminMainBackend.js
// Matches: Frontend/js/adminMain.js
// Main server entry point — sets up Express, middleware, and mounts all route modules

const express = require("express");
const cors = require("cors");

const adminEmployeesRouter = require("./adminEmployeesBackend");
const adminDashboardRouter = require("./adminDashboardBackend");
const adminSettingsRouter = require("./adminSettingsBackend");
const employeeRouter = require("./employeeBackend");
const loginRouter = require("./loginBackend");

const app = express();
app.use(cors());
app.use(express.json());

// Mount route modules
app.use("/", loginRouter);
app.use("/", adminEmployeesRouter);
app.use("/", adminDashboardRouter);
app.use("/", adminSettingsRouter);
app.use("/", employeeRouter);

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
