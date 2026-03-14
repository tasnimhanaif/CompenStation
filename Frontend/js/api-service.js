// api-service.js
// Centralized API service for CompenStation frontend-backend connection

const API_BASE_URL = "http://localhost:3000/api";

// Helper function to get token from localStorage
function getToken() {
  return localStorage.getItem("token");
}

// Helper function to make authenticated requests
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

// ================================================================
// AUTH API
// ================================================================

async function login(username, password, role = "employee") {
  // For demo purposes, we'll derive the ID from username
  // In production, backend would validate username/password
  let id = 1;
  if (username === "admin") {
    role = "admin";
    id = 0;
  }

  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, role, id }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  // Store token and user info
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
}

async function register(userData) {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  // Auto-login after registration
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

function getCurrentUser() {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}

// ================================================================
// EMPLOYEE API
// ================================================================

async function submitTimesheet(periodStart, periodEnd, hoursWorked, notes) {
  return apiRequest("/employee/timesheets/submit", {
    method: "POST",
    body: JSON.stringify({ periodStart, periodEnd, hoursWorked, notes }),
  });
}

async function getMyTimesheets() {
  return apiRequest("/employee/timesheets");
}

async function getMyPaystubs() {
  return apiRequest("/employee/paystubs");
}

async function getMyBenefits() {
  return apiRequest("/employee/benefits");
}

// ================================================================
// ADMIN - EMPLOYEE MANAGEMENT API
// ================================================================

async function addEmployee(employeeData) {
  return apiRequest("/admin/employees", {
    method: "POST",
    body: JSON.stringify(employeeData),
  });
}

async function getAllEmployees() {
  return apiRequest("/admin/employees");
}

async function getEmployeeById(id) {
  return apiRequest(`/admin/employees/${id}`);
}

async function updateEmployee(id, updates) {
  return apiRequest(`/admin/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

async function deleteEmployee(id, hardDelete = false) {
  return apiRequest(`/admin/employees/${id}?hard=${hardDelete}`, {
    method: "DELETE",
  });
}

// ================================================================
// ADMIN - BENEFITS MANAGEMENT API
// ================================================================

async function addEmployeeBenefit(employeeId, benefitData) {
  return apiRequest(`/admin/employees/${employeeId}/benefits`, {
    method: "POST",
    body: JSON.stringify(benefitData),
  });
}

async function getEmployeeBenefits(employeeId) {
  return apiRequest(`/admin/employees/${employeeId}/benefits`);
}

async function updateBenefit(benefitId, updates) {
  return apiRequest(`/admin/benefits/${benefitId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

async function deleteBenefit(benefitId) {
  return apiRequest(`/admin/benefits/${benefitId}`, {
    method: "DELETE",
  });
}

// ================================================================
// ADMIN - DEDUCTIONS/TAX MANAGEMENT API
// ================================================================

async function addEmployeeDeduction(employeeId, deductionData) {
  return apiRequest(`/admin/employees/${employeeId}/deductions`, {
    method: "POST",
    body: JSON.stringify(deductionData),
  });
}

async function getEmployeeDeductions(employeeId) {
  return apiRequest(`/admin/employees/${employeeId}/deductions`);
}

async function updateDeduction(deductionId, updates) {
  return apiRequest(`/admin/deductions/${deductionId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

async function deleteDeduction(deductionId) {
  return apiRequest(`/admin/deductions/${deductionId}`, {
    method: "DELETE",
  });
}

// ================================================================
// ADMIN - TIMESHEET MANAGEMENT API
// ================================================================

async function getAllTimesheets(status = null) {
  const query = status ? `?status=${status}` : "";
  return apiRequest(`/admin/timesheets${query}`);
}

async function approveTimesheet(timesheetId) {
  return apiRequest(`/admin/timesheets/${timesheetId}/approve`, {
    method: "POST",
  });
}

async function rejectTimesheet(timesheetId, reason) {
  return apiRequest(`/admin/timesheets/${timesheetId}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

// ================================================================
// ADMIN - PAYROLL API
// ================================================================

async function runPayroll(periodStart, periodEnd) {
  return apiRequest("/admin/payroll/run", {
    method: "POST",
    body: JSON.stringify({ periodStart, periodEnd }),
  });
}

async function getAllPaystubs() {
  return apiRequest("/admin/paystubs");
}

// ================================================================
// DEBUG API
// ================================================================

async function debugDump() {
  const response = await fetch(`${API_BASE_URL}/debug/dump`);
  return response.json();
}
