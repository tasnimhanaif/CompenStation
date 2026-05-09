import express from "express";
import cors    from "cors";
import pool    from "./Store/db.js";

import {
  getAllEmployees, getEmployeeById, getEmployeeByEmail,
  insertEmployee, updateEmployee, softDeleteEmployee,
  getAllUsers, getUserById, getUserByUsername,
  insertUser, updateUser, updateUserPassword,
  getAllTimesheets, getTimesheetsByEmployee, getTimesheetById,
  getTimesheetsByStatus, insertTimesheet, updateTimesheetStatus, markTimesheetPaid,
  getBenefitsByEmployee, insertBenefit, updateBenefit, deleteBenefit,
  getDeductionsByEmployee, insertDeduction, updateDeduction, deactivateDeduction,
  getAllPayrollRuns, getPayrollRunById, insertPayrollRun,
  getPayrollLinesByRun, getPayrollLinesByEmployee, insertPayrollLine,
  getPaystubsByEmployee, getPaystubById, insertPaystub,
  getAllSettingsBenefits, insertSettingsBenefit, updateSettingsBenefit, deleteSettingsBenefit,
  getAllTaxes, getTaxByType, upsertTax, deleteTax,
} from "./Store/queries.js";

import indexRoutes          from "./indexBackend.js";
import loginRoutes          from "./loginBackend.js";
import adminEmployeeRoutes  from "./adminEmployeesBackend.js";
import adminDashboardRoutes from "./adminDashboardBackend.js";
import adminSettingsRoutes  from "./adminSettingsBackend.js";
import employeeRoutes       from "./employeeBackend.js";

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CompenStation server running on http://localhost:${PORT}`);
});