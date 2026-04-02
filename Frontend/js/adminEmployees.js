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