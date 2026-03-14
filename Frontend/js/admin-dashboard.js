// admin-dashboard.js - Load and display admin data from backend

// Check if user is logged in and is admin
function checkAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = "index.html";
        return null;
    }
    if (user.role !== "admin") {
        alert("Access denied. Admin only.");
        window.location.href = "index.html";
        return null;
    }
    return user;
}

// Initialize dashboard on page load
document.addEventListener("DOMContentLoaded", async () => {
    const user = checkAuth();
    if (!user) return;

    // Set admin name in header
    document.getElementById("userName").textContent = user.username || "Admin";

    // Load initial data
    await loadDashboardData();
    await loadEmployeeList();
});

// ================================================================
// DASHBOARD DATA
// ================================================================
async function loadDashboardData() {
    try {
        const employees = await getAllEmployees();
        const timesheets = await getAllTimesheets();
        const paystubs = await getAllPaystubs();

        // Calculate dashboard stats
        const activeEmployees = employees.filter(e => e.isActive !== false).length;
        const pendingTimesheets = timesheets.filter(t => t.status === "SUBMITTED").length;
        
        // Calculate total pay from recent paystubs
        const totalPay = paystubs.reduce((sum, stub) => sum + (stub.netPay || 0), 0);

        // Update dashboard cards
        const cards = document.querySelectorAll(".content-card p");
        if (cards[0]) cards[0].textContent = `Employees: ${activeEmployees}`;
        if (cards[1]) cards[1].textContent = `Total pay: $${totalPay.toFixed(2)}`;
        if (cards[2]) cards[2].textContent = `Pending: ${pendingTimesheets}`;
        
        // Load payroll history
        await loadPayrollHistory(paystubs);

    } catch (error) {
        console.error("Error loading dashboard data:", error);
        alert(`Error loading dashboard: ${error.message}`);
    }
}

async function loadPayrollHistory(paystubs) {
    const historyContainer = document.querySelector(".payroll-history");
    if (!historyContainer) return;

    // Group paystubs by date
    const recentPaystubs = paystubs.slice(0, 10); // Show last 10

    let html = '<p class="regular-text">Payroll history</p>';
    html += '<ul style="list-style: none; padding: 10px;">';
    
    recentPaystubs.forEach(stub => {
        const date = new Date(stub.payPeriodEnd).toLocaleDateString();
        html += `<li style="padding: 5px 0;">
            ${date} - Employee #${stub.employeeId} - Net: $${stub.netPay.toFixed(2)}
        </li>`;
    });
    
    html += '</ul>';
    historyContainer.innerHTML = html;
}

// ================================================================
// EMPLOYEE LIST
// ================================================================
async function loadEmployeeList() {
    try {
        const employees = await getAllEmployees();
        const employeeListBody = document.getElementById("employeeList");
        
        if (!employeeListBody) return;

        employeeListBody.innerHTML = "";

        employees.forEach(emp => {
            const row = document.createElement("tr");
            
            const payRate = emp.hourlyRate 
                ? `$${emp.hourlyRate}/hr` 
                : emp.salary 
                ? `$${emp.salary}/yr` 
                : "N/A";

            row.innerHTML = `
                <td>${emp.fullName || "N/A"}</td>
                <td>${payRate}</td>
                <td>${emp.jobTitle || "N/A"}</td>
                <td>${emp.totalHours || 0}</td>
                <td>${emp.nextPayDate || "N/A"}</td>
            `;
            
            employeeListBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error loading employees:", error);
        alert(`Error loading employees: ${error.message}`);
    }
}

// ================================================================
// RUN PAYROLL
// ================================================================
async function handleRunPayroll() {
    const periodStart = prompt("Enter pay period start date (YYYY-MM-DD):");
    const periodEnd = prompt("Enter pay period end date (YYYY-MM-DD):");

    if (!periodStart || !periodEnd) {
        alert("Cancelled");
        return;
    }

    try {
        const result = await runPayroll(periodStart, periodEnd);
        alert(`Payroll run successful!\n\nTotal Employees: ${result.employeeCount}\nTotal Gross: $${result.totalGross.toFixed(2)}\nTotal Net: $${result.totalNet.toFixed(2)}`);
        
        // Reload dashboard data
        await loadDashboardData();
        
    } catch (error) {
        console.error("Error running payroll:", error);
        alert(`Payroll run failed: ${error.message}`);
    }
}

// ================================================================
// ADD EMPLOYEE FORM
// ================================================================
async function handleAddEmployee(event) {
    event.preventDefault();
    
    const form = event.target;
    const inputs = form.querySelectorAll('input, select');
    
    const employeeData = {
        fullName: `${inputs[0].value} ${inputs[1].value ? inputs[1].value + ' ' : ''}${inputs[2].value}`,
        birthDate: inputs[3].value,
        sex: inputs[4].value,
        employeeId: inputs[5].value,
        email: inputs[6].value,
        salary: parseFloat(inputs[7].value) || null,
        payFrequency: inputs[8].value,
        address: inputs[9].value,
        city: inputs[10].value,
        state: inputs[11].value,
        zipCode: inputs[12].value,
        phone: inputs[13].value,
        ssn: inputs[14].value,
        jobTitle: inputs[15].value,
    };

    try {
        const result = await addEmployee(employeeData);
        alert(`Employee added successfully!\nID: ${result.id}\nName: ${result.fullName}`);
        
        // Reset form and reload employee list
        form.reset();
        await loadEmployeeList();
        
        // Go back to employees page
        showPage("employees");
        
    } catch (error) {
        console.error("Error adding employee:", error);
        alert(`Failed to add employee: ${error.message}`);
    }
}

// ================================================================
// EVENT LISTENERS
// ================================================================

// Run payroll button
const runPayrollBtn = document.querySelector(".outline-container-header .btn-secondary");
if (runPayrollBtn) {
    runPayrollBtn.addEventListener("click", handleRunPayroll);
}

// Add employee button
const addEmployeeBtn = document.querySelector(".search-and-add-employee .btn-primary");
if (addEmployeeBtn) {
    addEmployeeBtn.addEventListener("click", () => {
        showPage("addEmployee");
    });
}

// Add employee form submit
const addEmployeeForm = document.querySelector(".employee-info");
if (addEmployeeForm) {
    addEmployeeForm.addEventListener("submit", handleAddEmployee);
}

// Logout button already handled in admin.html
