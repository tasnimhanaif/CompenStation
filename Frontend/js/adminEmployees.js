// Everything that happens on the Employees page of the admin
//import { employees } from "./sampleData";

// ---Show Employees screen
document.querySelector("#employees .btn-primary").addEventListener("click", () => {
      showPage("addEmployee");
});

// Cancel on "Add Employee" returns to employees list
document.querySelector("#addEmployee .btn-tertiary").addEventListener("click", () => {
      showPage("employees");
});

// Cancel on Edit Employee returns to employees list
document.querySelector("#editEmployee .btn-tertiary").addEventListener("click", () => {
      showPage("employees");
});

const employeeTableBody = document.querySelector("#employeeTableBody");
const archiveTableBody = document.querySelector("#archiveTableBody");

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

      archiveRow.querySelector('select').addEventListener('change', (e) => {
            employee.status = e.target.value;
            employee.statusChangeDate = Intl.DateTimeFormat("en-US").format(new Date());

            if(employee.status === 'active') {
                  archiveRow.remove();
                  loadSampleEmployees();
            } else {
                  archiveRow.cells[2].textContent = employee.statusChangeDate;
            }
      });
}

function createEmployeeRow(employee) {
      const row = document.createElement("tr");
      row.innerHTML = `
            <td>${employee.firstName} ${employee.lastName}</td>
            <td>$${(employee.pay / 52).toFixed(2)}</td>
            <td>${employee.jobTitle}</td>
            <td>${employee.hoursWorked}</td>
            <td>${createStatusSelect(employee.status)}</td>
            <td><button id="editBtn" class="edit-btn">Edit</button></td>
      `;
      row.querySelector('.edit-btn').addEventListener('click', () => {
            showPage("editEmployee");
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
      updateEmployeeCount(employees);
});

document.querySelector("#addEmployeeSubmit").addEventListener('submit', (e) => {
      e.preventDefault();
      loadSampleEmployees();
})

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