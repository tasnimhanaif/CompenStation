// storeMemory.js
// In-memory store for testing algorithms without a database.
// Usage: const { makeMemoryStore } = require("./Store/storeMemory");

let nextId = 1;
const id = () => nextId++;

function makeMemoryStore() {
  const employees  = [];
  const benefits   = [];
  const deductions = [];
  const timesheets  = [];
  const payrollRuns = [];
  const payrollLines = [];
  const paystubs    = [];

  return {
    // ----------------------------------------------------------------
    // EMPLOYEES
    // ----------------------------------------------------------------
    async createEmployee({ fullName, email, phone, address, department, jobTitle, hourlyRate }) {
      const emp = {
        id: id(), fullName, email,
        phone: phone || null,
        address: address || null,
        department: department || null,
        jobTitle: jobTitle || null,
        hourlyRate,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      employees.push(emp);
      return emp;
    },
    async getEmployeeById(empId) {
      return employees.find((e) => e.id === empId) || null;
    },
    async getEmployeeByEmail(email) {
      return employees.find((e) => e.email === email) || null;
    },
    async listEmployees() {
      return [...employees];
    },
    async updateEmployee(empId, patch) {
      const idx = employees.findIndex((e) => e.id === empId);
      if (idx < 0) return null;
      employees[idx] = { ...employees[idx], ...patch, updatedAt: new Date().toISOString() };
      return employees[idx];
    },
    async deleteEmployee(empId) {
      const idx = employees.findIndex((e) => e.id === empId);
      if (idx < 0) return false;
      employees.splice(idx, 1);
      return true;
    },

    // ----------------------------------------------------------------
    // BENEFITS
    // ----------------------------------------------------------------
    async createBenefit({ employeeId, benefitType, planName, employeeCost, employerCost, isEnrolled, effectiveDate, notes }) {
      const b = {
        id: id(), employeeId, benefitType,
        planName: planName || null,
        employeeCost: employeeCost ?? 0,
        employerCost: employerCost ?? 0,
        isEnrolled: isEnrolled !== undefined ? isEnrolled : true,
        effectiveDate: effectiveDate || null,
        notes: notes || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      benefits.push(b);
      return b;
    },
    async getBenefitById(bId) {
      return benefits.find((b) => b.id === bId) || null;
    },
    async listBenefitsByEmployee(employeeId) {
      return benefits.filter((b) => b.employeeId === employeeId);
    },
    async listAllBenefits() {
      return [...benefits];
    },
    async updateBenefit(bId, patch) {
      const idx = benefits.findIndex((b) => b.id === bId);
      if (idx < 0) return null;
      benefits[idx] = { ...benefits[idx], ...patch, updatedAt: new Date().toISOString() };
      return benefits[idx];
    },
    async deleteBenefit(bId) {
      const idx = benefits.findIndex((b) => b.id === bId);
      if (idx < 0) return false;
      benefits.splice(idx, 1);
      return true;
    },

    // ----------------------------------------------------------------
    // DEDUCTIONS
    // ----------------------------------------------------------------
    async createDeduction({ employeeId, deductionType, label, isPercentage, amount, isActive, notes }) {
      const d = {
        id: id(), employeeId, deductionType,
        label: label || null,
        isPercentage: isPercentage !== undefined ? isPercentage : true,
        amount: amount ?? 0,
        isActive: isActive !== undefined ? isActive : true,
        notes: notes || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      deductions.push(d);
      return d;
    },
    async getDeductionById(dId) {
      return deductions.find((d) => d.id === dId) || null;
    },
    async listDeductionsByEmployee(employeeId) {
      return deductions.filter((d) => d.employeeId === employeeId);
    },
    async listAllDeductions() {
      return [...deductions];
    },
    async updateDeduction(dId, patch) {
      const idx = deductions.findIndex((d) => d.id === dId);
      if (idx < 0) return null;
      deductions[idx] = { ...deductions[idx], ...patch, updatedAt: new Date().toISOString() };
      return deductions[idx];
    },
    async deleteDeduction(dId) {
      const idx = deductions.findIndex((d) => d.id === dId);
      if (idx < 0) return false;
      deductions.splice(idx, 1);
      return true;
    },

    // ----------------------------------------------------------------
    // TIMESHEETS
    // ----------------------------------------------------------------
    async createTimesheet({ employeeId, periodStart, periodEnd, hoursWorked, notes }) {
      const ts = {
        id: id(), employeeId, periodStart, periodEnd, hoursWorked,
        notes: notes || "",
        status: "DRAFT",
        submittedAt: null, reviewedAt: null, reviewedBy: null,
        paidAt: null, rejectionReason: "",
        createdAt: new Date().toISOString(),
      };
      timesheets.push(ts);
      return ts;
    },
    async getTimesheetById(tsId) {
      return timesheets.find((t) => t.id === tsId) || null;
    },
    async listTimesheetsByEmployee(employeeId) {
      return timesheets.filter((t) => t.employeeId === employeeId);
    },
    async listTimesheetsByStatus(status) {
      return timesheets.filter((t) => t.status === status);
    },
    async updateTimesheet(tsId, patch) {
      const idx = timesheets.findIndex((t) => t.id === tsId);
      if (idx < 0) return null;
      timesheets[idx] = { ...timesheets[idx], ...patch, updatedAt: new Date().toISOString() };
      return timesheets[idx];
    },

    // ----------------------------------------------------------------
    // PAYROLL
    // ----------------------------------------------------------------
    async createPayrollRun({ periodStart, periodEnd, executedBy, totalGross, totalDeductions, totalNet }) {
      const pr = {
        id: id(), periodStart, periodEnd, executedBy,
        totalGross, totalDeductions, totalNet,
        executedAt: new Date().toISOString(),
      };
      payrollRuns.push(pr);
      return pr;
    },
    async createPayrollLine({ payrollRunId, employeeId, timesheetId, grossPay, totalDeductions, netPay }) {
      const line = { id: id(), payrollRunId, employeeId, timesheetId, grossPay, totalDeductions, netPay };
      payrollLines.push(line);
      return line;
    },
    async createPaystub({ employeeId, payrollRunId, grossPay, totalDeductions, netPay }) {
      const stub = {
        id: id(), employeeId, payrollRunId,
        grossPay, totalDeductions, netPay,
        issuedAt: new Date().toISOString(),
      };
      paystubs.push(stub);
      return stub;
    },
    async listPaystubsByEmployee(employeeId) {
      return paystubs.filter((s) => s.employeeId === employeeId);
    },
    async listAllPaystubs() {
      return [...paystubs];
    },

    // Debug helper
    _dump() {
      return { employees, benefits, deductions, timesheets, payrollRuns, payrollLines, paystubs };
    },
  };
}

module.exports = { makeMemoryStore };
