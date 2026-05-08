// Everything that happens on the Dashboard page of the admin

const payrollHistoryBody = document.getElementById("payrollHistoryBody");

// ─── Run Payroll screen ───────────────────────────────────────────────────────
document.querySelector("#runPayrollBtn").addEventListener("click", () => {
      loadPayrollList();
      updateSubmitPayrollState();
      showPage("runPayroll");
});

// Cancel payroll goes back to dashboard
document.querySelector("#runPayroll .btn-tertiary").addEventListener("click", () => {
      showPage("dashboard");
});

// Update employee count
function updateEmployeeCount() {
  const activeCount = employees.filter(e => e.status === 'active').length;
  document.querySelector("#employeeCount p.card-info").textContent = activeCount;
}

// Update employee total pay
function updateTotalPay() {
  const total = employees
    .filter(e => e.status === 'active')
    .reduce((sum, e) => {
      if (e.payType === 'salary') {
        return sum + e.pay / 52;
      }
      // To-do --- hourly: calculate from hours worked
      return sum;
    }, 0);

  document.querySelector("#dashboardTotalPay").textContent =
    total.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function refreshDashboard() {
  updateEmployeeCount();
  updateTotalPay();
}

// Submit payroll -> record entry, back to dashboard
document.querySelector("#submitPayrollBtn").addEventListener("click", () => {
  if (isPayrollLockedForThisWeek()) return;
      
  const rows = document.querySelectorAll("#runPayrollList tr");
  if (rows.length === 0) return;

  const total = Array.from(rows)
    .reduce((sum, r) => sum + parseFloat(r.dataset.pay || 0), 0);

  const now = new Date();
  addPayrollHistoryEntry(
    Intl.DateTimeFormat("en-US").format(new Date()),
    total,
    rows.length
  );

  lastPayrollDate = now;          
  updateSubmitPayrollState();
  showPage("dashboard");
});

function loadPayrollList() {
  const tbody = document.querySelector("#runPayrollList");
  tbody.innerHTML = '';

  employees
    .filter(e => e.status === 'active')
    .forEach(employee => tbody.appendChild(createPayrollRow(employee)));

  updatePayrollTotal();
}

function createPayrollRow(employee) {
  const row = document.createElement('tr');
  const isSalary = employee.payType === 'salary';
  const initialPay = isSalary
    ? employee.pay / 52
    : employee.pay * (employee.hoursWorked || 0);

  row.dataset.pay = initialPay;
  row.innerHTML = `
    <td>${employee.firstName} ${employee.lastName}</td>
    <td class="pay-cell">$${initialPay.toFixed(2)}</td>
    <td>${isSalary
      ? 'N/A'
      : `<input type="number" class="hours-input" value="${employee.hoursWorked || 0}" min="0" step="0.25">`}</td>
    <td><button class="btn-tertiary view-check-btn" type="button">View</button></td>
  `;

  if (!isSalary) {
    const hoursInput = row.querySelector('.hours-input');
    const payCell = row.querySelector('.pay-cell');
    hoursInput.addEventListener('input', () => {
      const hours = parseFloat(hoursInput.value) || 0;
      const newPay = employee.pay * hours;
      row.dataset.pay = newPay;
      payCell.textContent = `$${newPay.toFixed(2)}`;
      updatePayrollTotal();
    });
  }

  return row;
}

function updatePayrollTotal() {
  const rows = document.querySelectorAll("#runPayrollList tr");
  const total = Array.from(rows)
    .reduce((sum, r) => sum + parseFloat(r.dataset.pay || 0), 0);

  document.querySelector("#totalPayrollAmount").textContent =
    total.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function addPayrollHistoryEntry(date, total, employeeCount) {
  const emptyRow = payrollHistoryBody.querySelector('.payroll-history-empty');
  if (emptyRow) emptyRow.remove();

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${date}</td>
    <td>${total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
    <td>${employeeCount}</td>
  `;
  payrollHistoryBody.appendChild(row);
}

let lastPayrollDate = null;  


function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();           
  const diff = day === 0 ? -6 : 1 - day;  
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isPayrollLockedForThisWeek() {
  if (!lastPayrollDate) return false;
  return getWeekStart(lastPayrollDate).getTime() === getWeekStart(new Date()).getTime();
}

function updateSubmitPayrollState() {
  const btn = document.querySelector("#submitPayrollBtn");
  if (isPayrollLockedForThisWeek()) {
    btn.disabled = true;
    btn.textContent = "Already submitted";
  } else {
    btn.disabled = false;
    btn.textContent = "Submit";
  }
}