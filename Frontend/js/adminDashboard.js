// Everything that happens on the Dashboard page of the admin
const payrollHistoryBody = document.getElementById("payrollHistoryBody");

// ─── Run Payroll screen ───────────────────────────────────────────────────────
document.querySelector("#runPayrollBtn").addEventListener("click", () => {
      showPage("runPayroll");
      if (typeof renderRunPayrollList === "function") renderRunPayrollList();
});

// Cancel payroll goes back to dashboard
document.querySelector("#runPayroll .btn-tertiary").addEventListener("click", () => {
      showPage("dashboard");
});

// Confirm payroll — calls API then updates history
document.querySelector("#runPayroll .btn-secondary").addEventListener("click", async () => {
      const submittedAt = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
      const totalPay = document.getElementById("totalPayrollAmount").textContent || "$0.00";
      const employeeCount = document.querySelector("#employeeCount .card-info").textContent || "0";

                                                                        // Build a date range for the current payroll period (today = end, 2 weeks ago = start)
                                                                        const periodEnd = new Date();
      const periodStart = new Date(periodEnd);
      periodStart.setDate(periodStart.getDate() - 14);

                                                                        try {
                                                                                const response = await fetch(`${API}/payroll/run`, {
                                                                                          method: "POST",
                                                                                          headers: { "Content-Type": "application/json" },
                                                                                          body: JSON.stringify({
                                                                                                      periodStart: periodStart.toISOString().slice(0, 10),
                                                                                                      periodEnd: periodEnd.toISOString().slice(0, 10),
                                                                                                      executedBy: "admin",
                                                                                          }),
                                                                                });
                                                                                if (!response.ok) {
                                                                                          const err = await response.json().catch(() => ({}));
                                                                                          console.warn("Payroll API warning:", err.error || response.status);
                                                                                }
                                                                        } catch (error) {
                                                                                console.error("Failed to run payroll via API:", error);
                                                                        }

                                                                        // Always update UI regardless of API result
                                                                        const emptyRow = payrollHistoryBody.querySelector(".payroll-history-empty");
      if (emptyRow) emptyRow.remove();

                                                                        const row = document.createElement("tr");
      row.innerHTML = `
          <td>${submittedAt}</td>
              <td>${totalPay}</td>
                  <td>${employeeCount}</td>
                    `;
      payrollHistoryBody.prepend(row);
      showPage("dashboard");
});
