// Everything that happens on the Employees page of the admin
const employeeTableBody = document.getElementById("employeeTableBody");
const runPayrollList = document.getElementById("runPayrollList");
const totalPayrollAmount = document.getElementById("totalPayrollAmount");
const dashboardTotalPay = document.getElementById("dashboardTotalPay");
const addEmployeeForm = document.querySelector("#addEmployeeForm");
const editEmployeeForm = document.querySelector("#editEmployeeForm");
const addEmployeeFields = getEmployeeFormFields(addEmployeeForm);
const editEmployeeFields = getEmployeeFormFields(editEmployeeForm);

let nextLocalEmployeeId = 1;
let editingEmployeeId = null;
let currentEmployees = [];

// ---Adding an employee---
document.querySelector("#employees .btn-primary").addEventListener("click", () => {
      resetEmployeeForm(addEmployeeForm, addEmployeeFields);
      showPage("addEmployee");
});

addEmployeeForm.addEventListener("submit", async event => {
      event.preventDefault();
      const newEmployee = readEmployeeFromForm(addEmployeeFields, {
              payType: "per_period",
              hours: "",
              payDate: "—",
      });
      const hoursWorkedValue = Number(newEmployee.hours);
      const hoursWorked = Number.isFinite(hoursWorkedValue) ? hoursWorkedValue : 0;

      const payload = {
              firstName: newEmployee.firstName,
              middleName: newEmployee.middleName,
              lastName: newEmployee.lastName,
              birthDate: newEmployee.birthDate,
              sex: newEmployee.sex,
              employeeCode: newEmployee.employeeCode,
              employmentType: newEmployee.payFrequency === 'bi-weekly' ? 'full-time' : 'part-time',
              email: newEmployee.email,
              payType: newEmployee.payType,
              pay: newEmployee.compensationValue,
              hoursWorked,
              address: newEmployee.address,
              city: newEmployee.city,
              state: newEmployee.state,
              zip: newEmployee.zip,
              ssn: newEmployee.ssn,
              phone: newEmployee.phone,
              jobTitle: newEmployee.jobTitle,
              benefitsList: newEmployee.selectedBenefits,
              accountType: 'employee',
      };

      try {
              const response = await fetch(`${API}/employees`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
              });
              const savedEmployee = await response.json();
              if (!response.ok) {
                      throw new Error(savedEmployee.error || `Failed to save employee: ${response.status}`);
              }
              currentEmployees.push(createApiEmployeeRecord(savedEmployee));
              renderEmployeeViews();
              resetEmployeeForm(addEmployeeForm, addEmployeeFields);
              showPage("employees");
      } catch (error) {
              alert("Failed to save employee: " + error.message);
              console.error("Failed to save employee:", error);
      }
});

editEmployeeForm.addEventListener("submit", async event => {
      event.preventDefault();
      if (!editingEmployeeId) { showPage("employees"); return; }
      const updatedEmployee = readEmployeeFromForm(editEmployeeFields,
                                                       currentEmployees.find(e => String(e.id) === String(editingEmployeeId)) || {}
                                                     );
      currentEmployees = currentEmployees.map(employee =>
              String(employee.id) === String(editingEmployeeId) ? { ...updatedEmployee, id: employee.id } : employee
                                                );
      renderEmployeeViews();

                                    // Only call API for non-local (i.e. DB-backed) employees
                                    if (!String(editingEmployeeId).startsWith("local-") && !String(editingEmployeeId).startsWith("sample-")) {
                                            try {
                                                      const hoursWorkedValue = Number(updatedEmployee.hours);
                                                      const hoursWorked = Number.isFinite(hoursWorkedValue) ? hoursWorkedValue : 0;
                                                      const response = await fetch(`${API}/employees/${editingEmployeeId}`, {
                                                                  method: "PATCH",
                                                                  headers: { "Content-Type": "application/json" },
                                                                  body: JSON.stringify({
                                                                                firstName: updatedEmployee.firstName,
                                                                                middleName: updatedEmployee.middleName,
                                                                                lastName: updatedEmployee.lastName,
                                                                                birthDate: updatedEmployee.birthDate,
                                                                                sex: updatedEmployee.sex,
                                                                                employeeCode: updatedEmployee.employeeCode,
                                                                                employmentType: updatedEmployee.payFrequency === 'bi-weekly' ? 'full-time' : 'part-time',
                                                                                email: updatedEmployee.email,
                                                                                payType: updatedEmployee.payType,
                                                                                pay: updatedEmployee.compensationValue,
                                                                                hoursWorked,
                                                                                address: updatedEmployee.address,
                                                                                city: updatedEmployee.city,
                                                                                state: updatedEmployee.state,
                                                                                zip: updatedEmployee.zip,
                                                                                ssn: updatedEmployee.ssn,
                                                                                phone: updatedEmployee.phone,
                                                                                jobTitle: updatedEmployee.jobTitle,
                                                                                benefitsList: updatedEmployee.selectedBenefits,
                                                                  }),
                                                      });
                                                      const result = await response.json();
                                                      if (!response.ok) throw new Error(result.error || `Failed to update employee: ${response.status}`);
                                            } catch (error) {
                                                      alert("Failed to update employee: " + error.message);
                                                      console.error("Failed to update employee:", error);
                                            }
                                    }

                                    editingEmployeeId = null;
      resetEmployeeForm(editEmployeeForm, editEmployeeFields);
      showPage("employees");
});

// ─── Benefits Checkboxes (employee form) ──────────────────────────────────────
function renderBenefitsCheckboxes(fields, selectedBenefits = []) {
      fields.benefitsContainer.innerHTML = "";
      benefits.forEach(benefit => {
              const isChecked = selectedBenefits.includes(benefit.name) ? "checked" : "";
              const label = document.createElement("label");
              label.innerHTML = `<input type="checkbox" name="benefits" value="${benefit.name}" ${isChecked}>${benefit.name}`;
              fields.benefitsContainer.appendChild(label);
      });
}

// Cancel on "Add Employee" goes back to employees list
document.querySelector("#addEmployee .btn-tertiary").addEventListener("click", () => {
      resetEmployeeForm(addEmployeeForm, addEmployeeFields);
      showPage("employees");
});

// Cancel on Edit Employee goes back to employees list
document.querySelector("#editEmployee .btn-tertiary").addEventListener("click", () => {
      editingEmployeeId = null;
      resetEmployeeForm(editEmployeeForm, editEmployeeFields);
      showPage("employees");
});

function getEmployeeFormFields(form) {
      return {
              firstName: form.querySelector('input[placeholder="First name"]'),
              middleName: form.querySelector('input[placeholder="Middle name (optional)"]'),
              lastName: form.querySelector('input[placeholder="Last name"]'),
              birthDate: form.querySelector('input[type="date"]'),
              sex: form.querySelector('select[name="sex"]'),
              employeeCode: form.querySelector('input[placeholder="Employee ID"]'),
              email: form.querySelector('input[type="email"]'),
              compensationValue: form.querySelector('input[placeholder="Salary"]'),
              payFrequency: form.querySelector('select[id="payFrequency"]'),
              address: form.querySelector('input[placeholder="Address"]'),
              city: form.querySelector('input[placeholder="City"]'),
              state: form.querySelector('select[id="stateSelect"]'),
              zip: form.querySelector('input[placeholder="ZIP"]'),
              phone: form.querySelector('input[placeholder="Phone"]'),
              ssn: form.querySelector('input[placeholder="SSN"]'),
              jobTitle: form.querySelector('input[placeholder="Job title"]'),
              benefitsContainer: form.querySelector(".benefits-selection"),
      };
}

function readEmployeeFromForm(fields, baseEmployee = {}) {
      return {
              ...baseEmployee,
              firstName: fields.firstName.value.trim(),
              middleName: fields.middleName.value.trim(),
              lastName: fields.lastName.value.trim(),
              birthDate: fields.birthDate.value,
              sex: fields.sex.value,
              employeeCode: fields.employeeCode.value.trim(),
              email: fields.email.value.trim(),
              compensationValue: fields.compensationValue.value.trim(),
              payType: baseEmployee.payType || "per_period",
              payFrequency: fields.payFrequency.value,
              address: fields.address.value.trim(),
              city: fields.city.value.trim(),
              state: fields.state.value,
              zip: fields.zip.value.trim(),
              phone: fields.phone.value.trim(),
              ssn: fields.ssn.value.trim(),
              jobTitle: fields.jobTitle.value.trim(),
              hours: baseEmployee.hours || "—",
              payDate: baseEmployee.payDate || "—",
              selectedBenefits: Array.from(fields.benefitsContainer.querySelectorAll('input[name="benefits"]:checked')).map(input => input.value),
      };
}

function populateEmployeeForm(fields, employee) {
      fields.firstName.value = employee.firstName || "";
      fields.middleName.value = employee.middleName || "";
      fields.lastName.value = employee.lastName || "";
      fields.birthDate.value = employee.birthDate || "";
      fields.sex.value = employee.sex || "male";
      fields.employeeCode.value = employee.employeeCode || "";
      fields.email.value = employee.email || "";
      fields.compensationValue.value = employee.compensationValue || "";
      fields.payFrequency.value = employee.payFrequency || "bi-weekly";
      fields.address.value = employee.address || "";
      fields.city.value = employee.city || "";
      fields.state.value = employee.state || "";
      fields.zip.value = employee.zip || "";
      fields.phone.value = employee.phone || "";
      fields.ssn.value = employee.ssn || "";
      fields.jobTitle.value = employee.jobTitle || "";
      renderBenefitsCheckboxes(fields, employee.selectedBenefits || []);
}

function resetEmployeeForm(form, fields) {
      form.reset();
      renderBenefitsCheckboxes(fields);
}

function splitFullName(fullName) {
      const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
      if (parts.length === 0) return { firstName: "", middleName: "", lastName: "" };
      if (parts.length === 1) return { firstName: parts[0], middleName: "", lastName: "" };
      if (parts.length === 2) return { firstName: parts[0], middleName: "", lastName: parts[1] };
      return { firstName: parts[0], middleName: parts.slice(1, -1).join(" "), lastName: parts[parts.length - 1] };
}

function createSampleEmployeeRecord(employee) {
      const payAmount = parsePayAmount(employee.pay);
      const nameParts = splitFullName(employee.name);
      return {
              id: `sample-${nextLocalEmployeeId++}`,
              ...nameParts,
              birthDate: "", sex: "male", employeeCode: "",
              email: "", compensationValue: String(payAmount * 26),
              payType: "per_period", payFrequency: "bi-weekly",
              address: "", city: "", state: "", zip: "", phone: "", ssn: "",
              jobTitle: employee.role || "", hours: employee.hours || "—",
              payDate: employee.payDate || "—", selectedBenefits: [],
      };
}

function createApiEmployeeRecord(employee) {
      return {
              id: employee.id ?? `api-${nextLocalEmployeeId++}`,
              firstName: employee.firstName || "",
              middleName: employee.middleName || "",
              lastName: employee.lastName || "",
              birthDate: employee.birthDate || "",
              sex: employee.sex || "male",
              employeeCode: employee.employeeCode || String(employee.id || ""),
              email: employee.email || "",
              compensationValue: String(Number(employee.pay || 0)),
              payType: employee.payType || "hourly",
              payFrequency: employee.employmentType === 'full-time' ? 'bi-weekly' : 'weekly',
              address: employee.address || "",
              city: employee.city || "",
              state: employee.state || "",
              zip: employee.zip || "",
              phone: employee.phone || "",
              ssn: employee.ssn || "",
              jobTitle: employee.jobTitle || "",
              hours: employee.hoursWorked || "—",
              payDate: "—",
              selectedBenefits: employee.benefitsList || [],
      };
}

function parsePayAmount(value) {
      const parsed = Number(String(value).replace(/[^0-9.-]/g, ""));
      return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value, minimumFractionDigits = 2, maximumFractionDigits = 2) {
      return Number(value).toLocaleString("en-US", { minimumFractionDigits, maximumFractionDigits });
}

function getEmployeeFullName(employee) {
      return [employee.firstName, employee.middleName, employee.lastName].filter(Boolean).join(" ").trim() || "—";
}

function getEmployeePayAmount(employee) {
      const compensationValue = Number(employee.compensationValue || 0);
      if (!Number.isFinite(compensationValue)) return 0;
      if (employee.payType === "hourly") return compensationValue;
      return Math.floor(compensationValue / 26);
}

function getEmployeePayLabel(employee) {
      const payAmount = getEmployeePayAmount(employee);
      if (employee.payType === "hourly") return `$${formatNumber(payAmount)}/hr`;
      return `$${formatNumber(payAmount, 0, 2)}`;
}

function getEmployeeRoleLabel(employee) {
      return employee.jobTitle || "—";
}

function getEmployeeActionsMarkup() {
      return `<td class="employee-actions-cell"><div class="employee-row-actions"><button class="button edit-btn"> Edit</button><button class="remove-employee-btn">Remove</button></div></td>`;
}

function renderEmployeeTable() {
      employeeTableBody.innerHTML = "";
      if (!currentEmployees.length) {
              employeeTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No employees found</td></tr>`;
              return;
      }
      currentEmployees.forEach(employee => {
              const row = document.createElement("tr");
              row.dataset.employeeId = String(employee.id);
              row.innerHTML = `
                    <td>${getEmployeeFullName(employee)}</td>
                          <td>${getEmployeePayLabel(employee)}</td>
                                <td>${getEmployeeRoleLabel(employee)}</td>
                                      <td>${employee.hours || "—"}</td>
                                            <td>${employee.payDate || "—"}</td>
                                                  ${getEmployeeActionsMarkup()}
                                                      `;
              employeeTableBody.appendChild(row);
      });
}

function renderRunPayrollList() {
      runPayrollList.innerHTML = "";
      if (!currentEmployees.length) {
              runPayrollList.innerHTML = `<tr><td colspan="3" style="text-align:center;">No employees found</td></tr>`;
              updateTotalPayDisplays();
              return;
      }
      currentEmployees.forEach(employee => {
              const row = document.createElement("tr");
              row.innerHTML = `
                    <td>${getEmployeeFullName(employee)}</td>
                          <td>${getEmployeePayLabel(employee)}</td>
                                <td>${employee.hours || "—"}</td>
                                    `;
              runPayrollList.appendChild(row);
      });
      updateTotalPayDisplays();
}

function updateEmployeeCount() {
      document.querySelector("#employeeCount .card-info").textContent = String(currentEmployees.length);
}

function updateTotalPayDisplays() {
      const totalPay = currentEmployees.reduce((sum, employee) => sum + getEmployeePayAmount(employee), 0);
      const formattedTotal = `$${formatNumber(totalPay)}`;
      totalPayrollAmount.textContent = formattedTotal;
      dashboardTotalPay.textContent = formattedTotal;
}

function renderEmployeeViews() {
      renderEmployeeTable();
      renderRunPayrollList();
      updateEmployeeCount();
}

// ─── API: Load Employees ──────────────────────────────────────────────────────
async function loadEmployees() {
      try {
              const response = await fetch(`${API}/employees`);
              if (!response.ok) throw new Error(`Failed to load employees: ${response.status}`);
              const apiEmployees = await response.json();
              currentEmployees = apiEmployees.map(createApiEmployeeRecord);
      } catch (err) {
              console.error("Failed to load employees:", err);
      }
      renderEmployeeViews();
}

// Ensure persisted employees are loaded on startup.
loadEmployees();

// Edit/Remove employee buttons
employeeTableBody.addEventListener("click", async event => {
      const editButton = event.target.closest(".edit-btn");
      const removeButton = event.target.closest(".remove-employee-btn");

                                     if (editButton) {
                                             const row = editButton.closest("tr");
                                             const employeeId = row?.dataset.employeeId;
                                             const selectedEmployee = currentEmployees.find(employee => String(employee.id) === employeeId);
                                             if (!selectedEmployee) return;
                                             editingEmployeeId = selectedEmployee.id;
                                             populateEmployeeForm(editEmployeeFields, selectedEmployee);
                                             showPage("editEmployee");
                                             return;
                                     }

                                     if (removeButton) {
                                             const row = removeButton.closest("tr");
                                             const employeeId = row?.dataset.employeeId;
                                             // Remove locally first for instant feedback
        currentEmployees = currentEmployees.filter(employee => String(employee.id) !== employeeId);
                                             renderEmployeeViews();
                                             // Call DELETE API for DB-backed employees
        if (!String(employeeId).startsWith("local-") && !String(employeeId).startsWith("sample-")) {
                  try {
                              const response = await fetch(`${API}/employees/${employeeId}`, { method: "DELETE" });
                              if (!response.ok) throw new Error(`Failed to delete employee: ${response.status}`);
                  } catch (error) {
                              console.error("Failed to delete employee from server:", error);
                  }
        }
                                     }
});

renderBenefitsCheckboxes(addEmployeeFields);
renderBenefitsCheckboxes(editEmployeeFields);
renderEmployeeViews();
