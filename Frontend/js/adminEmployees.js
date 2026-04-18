const API = "http://localhost:3000"
// Everything that happens on the Employees page of the admin

// ---Show Employees screen
document.querySelector("#employees .btn-primary").addEventListener("click", () => {
      showPage("addEmployee");
});

// Cancel on "Add Employee" goes back to employees list
document.querySelector("#addEmployee .btn-tertiary").addEventListener("click", () => {
      showPage("employees");
});

// Cancel on Edit Employee goes back to employees list
document.querySelector("#editEmployee .btn-tertiary").addEventListener("click", () => {
      showPage("employees");
});

// Load up employee list
const employeeTableBody = document.querySelector("#employeeTableBody");
async function loadEmployees() {
      try {
            const response = await fetch(`${API}/employees`);
            const employees = await response.json();
            employees.forEach(employee => {
                  const row = document.createElement('tr');
                  row.innerHTML = `
                        <td>${employee.fullName}</td>
                  `;
                  employeeTableBody.appendChild(row);
            });
      } catch(error) {
            console.error("Failed to load employees", error);
      }
}
loadEmployees();

// Add an employee
const addEmployeeForm = document.querySelector("#addEmployeeForm");
addEmployeeForm.addEventListener("submit", async(e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const selectedBenefits = formData.getAll('benefitsCheckboxes');
      const newEmployee = {
            firstName: document.querySelector("#firstNameInput").value,
            middleName: document.querySelector("#middleNameInput").value,
            lastName: document.querySelector("#lastNameInput").value,
            birthdate: document.querySelector("#birthdateInput").value,
            sex: document.querySelector("#sexInput").value,
            employeeID: document.querySelector("#employeeIDInput").value,
            email: document.querySelector("#emailInput").value,
            payType: document.querySelector("#payTypeInput").value,
            pay: document.querySelector("#payInput").value,
            payFrequency: document.querySelector("#payFrequencyInput").value,
            address: document.querySelector("#addressInput").value,
            city: document.querySelector("#cityInput").value,
            state: document.querySelector("#stateInput").value,
            zip: document.querySelector("#zipInput").value,
            phone: document.querySelector("#phoneInput").value,
            ssn: document.querySelector("#ssnInput").value,
            jobTitle: document.querySelector("#jobTitleInput").value,
            companyName: document.querySelector("#companyNameInput").value,
            companyID: document.querySelector("#companyIDInput").value,
            benefits: selectedBenefits
      }
      try {
            const response = await fetch(`${API}/employees`, {
                  method: 'POST',
                  headers: {
                  'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(newEmployee)
            });
            const data = await response.json();
            console.log('Server response:', data);
            addEmployeeForm.reset();
            showPage("employees");
            await loadEmployees(); // Refresh list after adding
      } catch (error) {
            console.error('Insert failed:', error);
      }
})


