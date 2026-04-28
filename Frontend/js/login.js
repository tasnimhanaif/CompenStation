// login.js - Connected to backend

// API base — use the same dynamic resolution strategy
const LOGIN_API = (window.APP_CONFIG && window.APP_CONFIG.API_URL)
  ? window.APP_CONFIG.API_URL
  : window.location.protocol + '//' + window.location.hostname + ':3000';

// API Helper Functions
async function login(username, password) {
  const response = await fetch(LOGIN_API + '/auth/login', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Login failed");
  if (data.token) localStorage.setItem("token", data.token);
  if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
  return data;
}

async function register(userData) {
  const response = await fetch(LOGIN_API + '/auth/register', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Registration failed");
  if (data.token) localStorage.setItem("token", data.token);
  if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
  return data;
}

const loginView = document.getElementById("login-view");
const createView = document.getElementById("create-account-view");
const employeeHome = document.getElementById("employee-home-view");
let accountType = "employee";

loginView.style.display = "flex";

document.getElementById("go-to-create").addEventListener("click", (e) => {
  e.preventDefault();
  loginView.style.display = "none";
  createView.style.display = "flex";
});

document.getElementById("go-to-login").addEventListener("click", (e) => {
  e.preventDefault();
  createView.style.display = "none";
  loginView.style.display = "flex";
});

document.getElementById("btn-employee").addEventListener("click", () => {
  accountType = "employee";
  document.getElementById("btn-employee").classList.add("active");
  document.getElementById("btn-admin").classList.remove("active");
  document.getElementById("job-title-field").style.display = "";
});

document.getElementById("btn-admin").addEventListener("click", () => {
  accountType = "admin";
  document.getElementById("btn-admin").classList.add("active");
  document.getElementById("btn-employee").classList.remove("active");
  document.getElementById("job-title-field").style.display = "none";
});

document.querySelector(".login-input").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = e.target.querySelector('input[type="text"]').value;
  const password = e.target.querySelector('input[type="password"]').value;
  if (!username || !password) { alert("Please enter username and password"); return; }
  try {
    const result = await login(username, password);
    if (result.user && result.user.role === "admin") {
      window.location.href = "admin.html";
    } else {
      loginView.style.display = "none";
      if (employeeHome) employeeHome.style.display = "flex";
      else window.location.href = "employee.html";
    }
  } catch (error) {
    alert("Login failed: " + error.message);
    console.error("Login error:", error);
  }
});

document.getElementById("create-account-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const inputs = e.target.querySelectorAll('input');
  const firstName = inputs[0].value;
  const middleName = inputs[1].value;
  const lastName = inputs[2].value;
  const email = inputs[3].value;
  const phone = inputs[4].value;
  const jobTitle = inputs[5].value;
  const employeeId = inputs[6].value;
  const username = inputs[7].value;
  const password = inputs[8].value;
  const confirmPassword = inputs[9].value;
  if (!firstName || !lastName || !email || !username || !password) { alert("Please fill in all required fields"); return; }
  if (password !== confirmPassword) { alert("Passwords do not match"); return; }
  try {
    const userData = {
      fullName: (firstName + (middleName ? ' ' + middleName : '') + ' ' + lastName).trim(),
      email, phone, username, password,
      role: accountType,
      employeeId: employeeId || undefined,
      jobTitle: accountType === "employee" ? jobTitle : undefined,
    };
    const result = await register(userData);
    if (accountType === "admin") {
      window.location.href = "admin.html";
    } else {
      createView.style.display = "none";
      if (employeeHome) employeeHome.style.display = "flex";
      else window.location.href = "employee.html";
    }
  } catch (error) {
    alert("Registration failed: " + error.message);
    console.error("Registration error:", error);
  }
});
