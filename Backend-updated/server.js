require("dotenv").config();
const express = require("express");
const cors = require("cors");
const store = require("./Store/storeDB");
const {    
    addEmployee, 
    modifyEmployee, 
    deleteEmployee,    
    submitTimesheet, 
    approveTimesheet, 
    rejectTimesheet,    
    runPayroll, 
    viewMyTimesheets
} = require("./algorithms");
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;
// --- Employees ---app.get("/employees", async (req, res) => {    const employees = await store.listEmployees();    res.json(employees);});app.post("/employees", async (req, res) => {    try {          const emp = await addEmployee(store, req.body);          res.json(emp);    } catch (e) {          res.status(400).json({ error: e.message });    }});app.patch("/employees/:id", async (req, res) => {    try {          const emp = await modifyEmployee(store, { employeeId: Number(req.params.id), ...req.body });          res.json(emp);
