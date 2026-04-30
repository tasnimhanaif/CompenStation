// Everything that happens on the Dashboard page of the admin

const payrollHistoryBody = document.getElementById("payrollHistoryBody");

// ─── Run Payroll screen ───────────────────────────────────────────────────────
document.querySelector("#runPayrollBtn").addEventListener("click", () => {
      showPage("runPayroll");
});

// Cancel payroll goes back to dashboard
document.querySelector("#runPayroll .btn-tertiary").addEventListener("click", () => {
      showPage("dashboard");
});