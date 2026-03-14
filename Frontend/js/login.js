// login.js - Updated with backend connection
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

// ================================================================
// LOGIN FORM SUBMIT - CONNECTED TO BACKEND
// ================================================================
document.querySelector(".login-input").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const username = e.target.querySelector('input[type="text"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    if (!username || !password) {
        alert("Please enter username and password");
        return;
    }

    try {
        // Call backend login API
        const result = await login(username, password);
        
        // Redirect based on role
        if (result.user.role === "admin") {
            window.location.href = "admin.html";
        } else {
            // For employees, stay on same page but show employee home view
            loginView.style.display = "none";
            employeeHome.style.display = "flex";
        }
    } catch (error) {
        alert(`Login failed: ${error.message}`);
        console.error("Login error:", error);
    }
});

// ================================================================
// CREATE ACCOUNT FORM SUBMIT - CONNECTED TO BACKEND
// ================================================================
document.getElementById("create-account-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const inputs = e.target.querySelectorAll('input');
    
    // Extract form values
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

    // Validation
    if (!firstName || !lastName || !email || !username || !password) {
        alert("Please fill in all required fields");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    try {
        // Prepare user data for registration
        const userData = {
            fullName: `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`,
            email,
            phone,
            username,
            password,
            role: accountType,
            employeeId: employeeId || undefined,
            jobTitle: accountType === "employee" ? jobTitle : undefined,
        };

        // Call backend register API
        const result = await register(userData);
        
        // Redirect based on account type
        if (accountType === "admin") {
            window.location.href = "admin.html";
        } else {
            createView.style.display = "none";
            employeeHome.style.display = "flex";
        }
    } catch (error) {
        alert(`Registration failed: ${error.message}`);
        console.error("Registration error:", error);
    }
});
