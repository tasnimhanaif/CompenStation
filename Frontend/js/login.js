const loginView = document.getElementById("login-view");
const createView = document.getElementById("create-account-view");
const employeeHome = document.getElementById("employee-home-view");

let accountType = "employee";

// Show login by default
loginView.style.display = "flex";

// Switch to create account
document.getElementById("go-to-create").addEventListener("click", (e) => {
    e.preventDefault();
    loginView.style.display = "none";
    createView.style.display = "flex";
});

// Switch back to login
document.getElementById("go-to-login").addEventListener("click", (e) => {
    e.preventDefault();
    createView.style.display = "none";
    loginView.style.display = "flex";
});

// Account type toggle
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

// Create account form submit
document.getElementById("create-account-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (accountType === "admin") {
        window.location.href = "admin.html";
    } else {
        createView.style.display = "none";
        employeeHome.style.display = "flex";
    }
});
