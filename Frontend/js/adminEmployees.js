// Everything that happens on the Employees page of the admin
//import { employees } from "./sampleData";

// Element variables
const employeeTableBody = document.querySelector("#employeeTableBody");
const archiveTableBody = document.querySelector("#archiveTableBody");
const addEmployeeBtn = document.querySelector("#addEmployeeBtn");
const employeeForm = document.querySelector("#employeeForm");
const employeeTable = document.querySelector("#employeeTable");
const submitBtn = document.querySelector("#employeeSubmit");
// let employees = [];  <-- we'll keep the employee list in memory after the fetch call

// ---Show Add Employees screen
addEmployeeBtn.addEventListener("click", () => {
      openAddForm();
});

// input validation for Pay input field on add/edit employee
document.querySelectorAll(
    "#employeeForm input[name='pay']"
).forEach(input => {
    input.addEventListener("input", () => {
        input.value = input.value.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1");
    });
});

// Cancel on Add/Edit employee returns to employees list
document.querySelector("#addEditEmployee .btn-tertiary").addEventListener("click", () => {
      showPage("employees");
});

function createStatusSelect(currentStatus) {
      const statuses = ['active', 'terminated', 'quit', 'disabled', 'retired'];
      return `
            <select>
                  ${statuses.map(s => 
                        `<option value="${s}" ${currentStatus === s ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`
                  ).join('')}
            </select>
      `;
}

function archiveEmployee(employee, row) {
      const archiveRow = document.createElement('tr');
      archiveRow.innerHTML = `
            <td>${employee.firstName} ${employee.lastName}</td>
            <td>${createStatusSelect(employee.status)}</td>
            <td>${employee.statusChangeDate}</td>
      `;
      archiveTableBody.appendChild(archiveRow);
      row.remove();
      refreshDashboard();

      archiveRow.querySelector('select').addEventListener('change', (e) => {
            employee.status = e.target.value;
            employee.statusChangeDate = Intl.DateTimeFormat("en-US").format(new Date());

            if(employee.status === 'active') {
                  archiveRow.remove();
                  loadSampleEmployees();
                  refreshDashboard();
            } else {
                  archiveRow.cells[2].textContent = employee.statusChangeDate;
                  refreshDashboard();
            }
      });
}

function createEmployeeRow(employee) {
      const row = document.createElement("tr");
      row.innerHTML = `
            <td>${employee.firstName} ${employee.lastName}</td>
            <td>$${(employee.pay / 52).toFixed(2)}</td>
            <td>${employee.jobTitle}</td>
            <td>${employee.payType === "salary" ? "N/A": employee.hoursWorked}</td>
            <td>${createStatusSelect(employee.status)}</td>
            <td><button id="editBtn" class="edit-btn">Edit</button></td>
      `;
      row.querySelector('.edit-btn').addEventListener('click', () => {
            openEditForm(employee);
      });
      row.querySelector('select').addEventListener('change', (e) => {
            employee.status = e.target.value;
            employee.statusChangeDate = Intl.DateTimeFormat("en-US").format(new Date());

            if(employee.status !== 'active') {
                  archiveEmployee(employee, row);
            }
      });
      return row;
}

function loadSampleEmployees() {
      employeeTableBody.innerHTML = '';
      employees.forEach(employee => {
            employeeTableBody.appendChild(createEmployeeRow(employee));
      });
}

document.addEventListener('DOMContentLoaded', () => {
      loadSampleEmployees();
      refreshDashboard();
});

// Load employee form. Add employee empty, and Edit employee pre-filled
let prefilledData = null;
function openAddForm() {
      prefilledData = null;
      screenName.textContent = "Add Employee";
      document.querySelector("#employeeForm").reset();
      renderBenefitsCheckboxes();
      showPage("addEditEmployee");
      submitBtn.innerHTML = "Add";
}
function fillForm(employee) {
  const form = document.getElementById('employeeForm');
  for (const [key, value] of Object.entries(employee)) {
    if (form.elements[key]) {
      form.elements[key].value = value ?? '';
    }
  }
}
function openEditForm(employee) {
      prefilledData = employee.employeeID;
      screenName.textContent = "Edit Employee";
      fillForm(employee);
      renderBenefitsCheckboxes(employee.benefits ?? []);
      showPage("addEditEmployee");
      submitBtn.innerHTML = "Save";
}

const benefitsCheckboxes = document.querySelector("#benefitsCheckboxes");
function renderBenefitsCheckboxes(employeeBenefits = []) {
    benefitsCheckboxes.innerHTML = '';
    benefits.forEach(benefit => {
        const label = document.createElement('label');
        label.className = 'benefit-checkbox';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = 'benefits';
        input.value = benefit.name;
        input.checked = employeeBenefits.includes(benefit.name);

        label.appendChild(input);
        label.append(' ' + benefit.name);
        benefitsCheckboxes.appendChild(label);
    });
}
function generateEmployeeID() {
    if (employees.length === 0) return 1;
    return Math.max(...employees.map(emp => emp.employeeID)) + 1;
}

document.querySelector("#employeeForm").addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("submit fired", e);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.benefits = formData.getAll('benefits');

    // Coerce numeric fields, guarding against empty strings
    data.pay = parseFloat(data.pay) || 0;
    data.hoursWorked = parseFloat(data.hoursWorked) || 0;

    // Make sure employeeID never sneaks in as a string
    delete data.employeeID;

    if (prefilledData == null) {
        // ADD
        data.employeeID = generateEmployeeID();
        data.status = 'active';                    // <-- the missing piece
        data.statusChangeDate = Intl.DateTimeFormat("en-US").format(new Date());
        employees.push(data);
    } else {
        // EDIT
        const idx = employees.findIndex(emp => emp.employeeID === prefilledData);
        if (idx !== -1) {
            employees[idx] = { ...employees[idx], ...data };
        }
    }

    loadSampleEmployees();
    refreshDashboard();
    showPage("employees");
});

// ---------------------------------------
//     B U T T O N S
//----------------------------------------  
 
// Archive Button
const archiveBtn = document.querySelector("#archiveBtn");
archiveBtn.addEventListener("click", () => {
      showPage("archive");
})

// Back Button on Archive screen
const backBtn = document.querySelector("#backBtn");
backBtn.addEventListener("click", () => {
      showPage("employees");
})