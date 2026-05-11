// adminMainBackend.js
// Matches: Frontend/js/adminMain.js
// Main server entry point — sets up Express, middleware, and mounts all route modules
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const adminEmployeesRouter = require("./adminEmployeesBackend");
const adminDashboardRouter = require("./adminDashboardBackend");
const adminSettingsRouter = require("./adminSettingsBackend");
const employeeRouter = require("./employeeBackend");
const loginRouter = require("./loginBackend");
const indexRouter = require("./indexBackend");
const store = require("./Store/storeDB");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "Frontend")));

// Mount route modules
app.use("/", indexRouter);
app.use("/", loginRouter);
app.use("/", adminEmployeesRouter);
app.use("/", adminDashboardRouter);
app.use("/", adminSettingsRouter);
app.use("/", employeeRouter);

async function ensureDefaultAdmin() {
  try {
    const existingAdmin = await store.findUserByUsername("admin");
    if (!existingAdmin) {
      console.log("Creating default admin account: admin / admin123");
      await store.createUser({
        fullName: "Administrator",
        email: "admin@example.com",
        phone: null,
        username: "admin",
        password: "admin123",
        role: "admin",
      });
    }
  } catch (err) {
    console.error("Failed to ensure default admin account:", err);
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await ensureDefaultAdmin();
});
