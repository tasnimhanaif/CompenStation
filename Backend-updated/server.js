require("dotenv").config();
const express = require("express");
const cors    = require("cors");
 
const indexRoutes          = require("./indexBackend");
const loginRoutes          = require("./loginBackend");
const adminEmployeeRoutes  = require("./adminEmployeesBackend");
const adminDashboardRoutes = require("./adminDashboardBackend");
const adminSettingsRoutes  = require("./adminSettingsBackend");
const employeeRoutes       = require("./employeeBackend");
const sampleDataRoutes     = require("./sampleDataBackend");
 
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("Frontend"));
 
app.use("/", indexRoutes);
app.use("/", loginRoutes);
app.use("/", adminEmployeeRoutes);
app.use("/", adminDashboardRoutes);
app.use("/", adminSettingsRoutes);
app.use("/", employeeRoutes);
app.use("/", sampleDataRoutes);
 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CompenStation server running on http://localhost:${PORT}`);
});