const API = "http://localhost:3000";

// ─── Page Navigation ───────────────────────────────────────────────────────
const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll(".nav-link");
const screenName = document.querySelector("#screen");

function showPage(id) {
    pages.forEach(page => page.style.display = "none");
    document.getElementById(id).style.display = "flex";
}

function setActiveLink(activeLink) {
    navLinks.forEach(l => {
        l.classList.remove("active");
        const img = l.querySelector("img");
        if (img) img.src = img.src.replace("_light.svg", "_dark.svg");
    });
    activeLink.classList.add("active");
    const img = activeLink.querySelector("img");
    if (img) img.src = img.src.replace("_dark.svg", "_light.svg");
}

navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = link.dataset.target;
        showPage(target);
        setActiveLink(link);
        if (target === "employees") loadEmployees();
        screenName.textContent = e.target.textContent;
    });
});

// Show dashboard by default
showPage("dashboard");
setActiveLink(document.querySelector('[data-target="dashboard"]'));

// ─── Run Payroll screen ─────────────────────────────────────────────────────
document.querySelector("#runPayrollBtn").addEventListener("click", () => {
    showPage("runPayroll");
    loadApprovedTimesheets();
});

// ─── Settings: Benefits Panel ───────────────────────────────────────────────
function renderSettingsBenefits() {
    const list = document.getElementById("benefitsList");
    list.innerHTML = "";
    benefits.forEach((benefit, index) => {
        const li = document.createElement("li");
        li.className = "list-item";
        li.innerHTML = `<span>${benefit.name}</span><button class="remove"><img src="icons/close_light.svg" alt="remove"></button>`;
        li.addEventListener("click", () => {
            list.querySelectorAll(".list-item").forEach(i => i.classList.remove("selected"));
            li.classList.add("selected");
            document.getElementById("benefitNameInput").value = benefit.name;
            document.getElementById("benefitPercentageInput").value = benefit.percentage;
        });
        li.querySelector(".remove").addEventListener("click", (e) => {
            e.stopPropagation();
            benefits.splice(index, 1);
            renderSettingsBenefits();
        });
        list.appendChild(li);
    });
}

// ─── Settings: State Tax Panel ───────────────────────────────────────────────
function renderStateTaxes() {
    const list = document.getElementById("stateTaxList");
    list.innerHTML = "";
    stateTaxes.forEach((tax, index) => {
        const li = document.createElement("li");
        li.className = "list-item";
        li.innerHTML = `<span>${tax}%</span><button class="remove"><img src="icons/close_light.svg" alt="remove"></button>`;
        li.addEventListener("click", () => {
            list.querySelectorAll(".list-item").forEach(i => i.classList.remove("selected"));
            li.classList.add("selected");
            document.getElementById("stateTaxPercentageInput").value = tax;
        });
        li.querySelector(".remove").addEventListener("click", (e) => {
            e.stopPropagation();
            stateTaxes.splice(index, 1);
            renderStateTaxes();
        });
        list.appendChild(li);
    });
}

// ─── Settings: Federal Tax Panel ─────────────────────────────────────────────
function renderFederalTaxes() {
    const list = document.getElementById("federalTaxList");
    list.innerHTML = "";
    federalTaxes.forEach((tax, index) => {
        const li = document.createElement("li");
        li.className = "list-item";
        li.innerHTML = `<span>${tax}%</span><button class="remove"><img src="icons/close_light.svg" alt="remove"></button>`;
        li.addEventListener("click", () => {
            list.querySelectorAll(".list-item").forEach(i => i.classList.remove("selected"));
            li.classList.add("selected");
            document.getElementById("federalTaxPercentageInput").value = tax;
        });
        li.querySelector(".remove").addEventListener("click", (e) => {
            e.stopPropagation();
            federalTaxes.splice(index, 1);
            renderFederalTaxes();
        });
        list.appendChild(li);
    });
}

// ─── Benefits Checkboxes (employee form) ────────────────────────────────────
function renderBenefitsCheckboxes() {
    const container = document.getElementById("benefitsCheckboxes");
    container.innerHTML = "";
    benefits.forEach(benefit => {
        const label = document.createElement("label");
        label.innerHTML = `<input type="checkbox" name="benefits" value="${benefit.name}">${benefit.name}`;
        container.appendChild(label);
    });
}

// ─── Number-only enforcement for percentage inputs ───────────────────────────
document.querySelectorAll("#benefitPercentageInput, #stateTaxPercentageInput, #federalTaxPercentageInput").forEach(input => {
    input.addEventListener("input", () => {
        input.value = input.value.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1");
    });
});

// Populate settings on load
renderSettingsBenefits();
renderStateTaxes();
renderFederalTaxes();

// ─── Settings: Add Benefit ───────────────────────────────────────────────────
document.getElementById("addBenefitBtn").addEventListener("click", () => {
    const name = document.getElementById("benefitNameInput").value.trim();
    const percentage = parseFloat(document.getElementById("benefitPercentageInput").value);
    if (!name || isNaN(percentage)) return;
    benefits.push({ name, percentage });
    renderSettingsBenefits();
    document.getElementById("benefitNameInput").value = "";
    document.getElementById("benefitPercentageInput").value = "";
});

// ─── Settings: Add State Tax ─────────────────────────────────────────────────
document.getElementById("addStateTaxBtn").addEventListener("click", () => {
    const percentage = parseFloat(document.getElementById("stateTaxPercentageInput").value);
    if (isNaN(percentage)) return;
    stateTaxes.push(percentage);
    renderStateTaxes();
    document.getElementById("stateTaxPercentageInput").value = "";
});

// ─── Settings: Add Federal Tax ───────────────────────────────────────────────
document.getElementById("addFederalTaxBtn").addEventListener("click", () => {
    const percentage = parseFloat(document.getElementById("federalTaxPercentageInput").value);
    if (isNaN(percentage)) return;
    federalTaxes.push(percentage);
    renderFederalTaxes();
    document.getElementById("federalTaxPercentageInput").value = "";
});

// ─── Add Employee button ────────────────────────────────────────────────────
document.querySelector("#employees .btn-primary").addEventListener("click", () => {
    renderBenefitsCheckboxes();
    showPage("addEmployee");
});

// Cancel on Add Employee goes back to employees list
document.querySelector("#addEmployee .btn-tertiary").addEventListener("click", () => {
    showPage("employees");
    loadEmployees();
});

// ─── API: Load Employees ────────────────────────────────────────────────────
async function loadEmployees() {
    try {
        const res = await fetch(`${API}/employees`);
        const employees = await res.json();
        const tbody = document.getElementById("employeeTableBody");
        tbody.innerHTML = "";

        if (employees.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No employees found</td></tr>`;
            return;
        }

        employees.forEach(emp => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${emp.fullName}</td>
                <td>$${Number(emp.hourlyRate).toFixed(2)}/hr</td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Failed to load employees:", err);
    }
}

// ─── API: Load Approved Timesheets for Run Payroll ─────────────────────────
async function loadApprovedTimesheets() {
    try {
        const res = await fetch(`${API}/employees`);
        const employees = await res.json();

        // Build a lookup map: id → employee
        const empMap = {};
        employees.forEach(e => empMap[e.id] = e);

        // Fetch approved timesheets via a dedicated endpoint (fallback: use each employee)
        const tsRes = await fetch(`${API}/timesheets/status/APPROVED`);
        const timesheets = await tsRes.json();

        const tbody = document.getElementById("runPayrollList");
        tbody.innerHTML = "";

        let total = 0;

        if (!timesheets.length) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">No approved timesheets</td></tr>`;
            document.getElementById("totalPayrollAmount").textContent = "$0.00";
            return;
        }

        timesheets.forEach(ts => {
            const emp = empMap[ts.employeeId];
            const gross = Number(ts.hoursWorked) * Number(emp?.hourlyRate || 0);
            total += gross;
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${emp?.fullName || "Unknown"}</td>
                <td>$${gross.toFixed(2)}</td>
                <td>${ts.hoursWorked} hrs</td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById("totalPayrollAmount").textContent = `$${total.toFixed(2)}`;
    } catch (err) {
        console.error("Failed to load timesheets:", err);
    }
}

// Cancel payroll goes back to dashboard
document.querySelector("#runPayroll .btn-tertiary").addEventListener("click", () => {
    showPage("dashboard");
});

// Add Employee---------------------------------------------------------- 

// after add employee submission
function addRow(employee) {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${employee.name}</td><td>${employee.pay}</td><td>${employee.role}</td>
    <td>${employee.hours}</td><td>${employee.payDate}</td><td><button class="button edit-btn">Edit</button>
    </td>`;
    document.getElementById("employeeTableBody").appendChild(row);
};

// Populate table with sample data
employees.forEach(addRow);

document.getElementById("addEmployeeForm").addEventListener('submit', function(e) {
    e.preventDefault();
    const newEmployee = {
        name: document.getElementById("firstNameInput").value + " " +
              document.getElementById("LastNameInput").value,

        // pay = salary/26 payments(bi-weekly)
        pay: Math.floor(document.getElementById("salaryInput").value / 26),
        role: document.getElementById("roleInput").value,
    };

    employees.push(newEmployee);
    addRow(newEmployee);
    this.reset();
})

// Updates employee list as user enters more characters in the search bar
const search = document.getElementById("searchEmployees");

// Edit Employee button
document.getElementById("employeeTableBody").addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn")) {
        renderBenefitsCheckboxes();
        showPage("addEmployee");
    }
});
