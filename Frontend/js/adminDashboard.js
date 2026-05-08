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
    <td><button class="view-check-btn" type="button" data-employee-id="${employee.employeeID}">
    <img src="icons/checkbook_dark.svg" alt="checkbook"></button></td>
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

// ----- Helpers -----
// Handle check viewing
function numberToWords(amount) {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
    'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  function under1000(n) {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) {
      const t = tens[Math.floor(n / 10)];
      const o = ones[n % 10];
      return o ? `${t}-${o}` : t;
    }
    const hundred = `${ones[Math.floor(n / 100)]} hundred`;
    const rest = n % 100;
    return rest ? `${hundred} ${under1000(rest)}` : hundred;
  }

  const dollars = Math.floor(amount);
  const cents = Math.round((amount - dollars) * 100);

  let words;
  if (dollars === 0) {
    words = 'zero';
  } else {
    const millions = Math.floor(dollars / 1_000_000);
    const thousands = Math.floor((dollars % 1_000_000) / 1000);
    const remainder = dollars % 1000;

    const parts = [];
    if (millions)  parts.push(`${under1000(millions)} million`);
    if (thousands) parts.push(`${under1000(thousands)} thousand`);
    if (remainder) parts.push(under1000(remainder));
    words = parts.join(' ');
  }

  // Capitalize, append cents in "n/100" form to match the Figma design
  words = words.charAt(0).toUpperCase() + words.slice(1);
  return `${words} ${cents}/100`;
}

function formatCheckDate(date = new Date()) {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

function formatDollarAmount(amount) {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ----- Populate the check from an employee -----

function populateCheck(employee) {
  const setField = (name, value) => {
    const el = document.querySelector(`.check [data-field="${name}"]`);
    if (el) el.textContent = value;
  };

  const fullName = `${employee.firstName} ${employee.lastName}`;
  const amount   = Number(employee.pay); 

  setField('payeeName',     fullName);
  setField('date',          formatCheckDate());
  setField('amountNumeric', formatDollarAmount(amount));
  setField('amountWords',   numberToWords(amount));
}

document.addEventListener('click', (e) => {
  const viewBtn = e.target.closest('.view-check-btn');
  if (viewBtn) {
    const id = viewBtn.dataset.employeeId;
    const employee = employees.find(emp => String(emp.employeeID) === String(id));
    if (!employee) return;
    populateCheck(employee);
    showPage('viewCheck'); 
    return;
  }

  if (e.target.id === 'cancelCheckBtn') {
    showPage('runPayroll'); 
    return;
  }

  if (e.target.id === 'printCheckBtn') {
    window.print();
    return;
  }
});

// --- Helper: Calculate Deductions ---
function calculateDeductions(grossPay, employee) {
    
    const medicalRate = 0.03;   
    const stateTaxRate = 0.049; 
    const federalTaxRate = 0.082;

    const medicalDed = grossPay * medicalRate;
    const stateDed = grossPay * stateTaxRate;
    const federalDed = grossPay * federalTaxRate;

    const totalDeductions = medicalDed + stateDed + federalDed;
    const netPay = grossPay - totalDeductions;

    return {
        gross: grossPay,
        medical: { amount: medicalDed, rate: medicalRate },
        stateTax: { amount: stateDed, rate: stateTaxRate },
        federalTax: { amount: federalDed, rate: federalTaxRate },
        net: netPay
    };
}

// --- Updated: Create Payroll Row ---
function createPayrollRow(employee) {
    const fragment = document.createDocumentFragment();

    const mainRow = document.createElement('tr');
    mainRow.classList.add('employee-row');

    const dedRow = document.createElement('tr');
    dedRow.classList.add('deduction-row', 'hidden');

    const isSalary = employee.payType === 'salary';
    const initialHours = employee.hoursWorked || 0;

    mainRow.innerHTML = `
        <td>${employee.firstName} ${employee.lastName}</td>
        <td class="pay-cell"></td>
        <td>${isSalary 
            ? 'N/A' 
            : `<input type="number" class="hours-input" value="${initialHours}" min="0" step="0.25">`}
        </td>
        <td>
            <button class="view-check-btn" type="button" data-employee-id="${employee.employeeID}">
                <img src="icons/checkbook_dark.svg" alt="checkbook">
            </button>
        </td>
    `;

    dedRow.innerHTML = `
        <td colspan="4">
            <div class="deduction-container">
                <div class="deduction-header regular-text">Deductions</div>
                <div class="deduction-line">
                    <span>Gross Pay</span>
                    <span class="gross-val"></span>
                </div>
                <div class="deduction-line">
                    <span>Medical</span>
                    <span class="negative-val medical-val"></span>
                </div>
                <div class="deduction-line">
                    <span>State Tax</span>
                    <span class="negative-val state-val"></span>
                </div>
                <div class="deduction-line">
                    <span>Federal Tax</span>
                    <span class="negative-val fed-val"></span>
                </div>
                <div class="deduction-line final">
                    <span class="regular-text">Final amount:</span>
                    <span class="final-val"></span>
                </div>
            </div>
        </td>
    `;

    const updateValues = (currentHours) => {
        const grossPay = isSalary ? employee.pay / 52 : employee.pay * currentHours;
        const deductions = calculateDeductions(grossPay, employee);

        const formatMoney = (num) => '$' + num.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0});
        const formatPct = (rate) => (rate * 100).toFixed(1) + '%';

        mainRow.querySelector('.pay-cell').textContent = formatMoney(deductions.net);
        mainRow.dataset.pay = deductions.net;

        dedRow.querySelector('.gross-val').textContent = formatMoney(deductions.gross);
        dedRow.querySelector('.medical-val').textContent = `-${formatMoney(deductions.medical.amount)} (${formatPct(deductions.medical.rate)})`;
        dedRow.querySelector('.state-val').textContent = `-${formatMoney(deductions.stateTax.amount)} (${formatPct(deductions.stateTax.rate)})`;
        dedRow.querySelector('.fed-val').textContent = `-${formatMoney(deductions.federalTax.amount)} (${formatPct(deductions.federalTax.rate)})`;
        dedRow.querySelector('.final-val').textContent = formatMoney(deductions.net);
    };

    updateValues(initialHours);

    if (!isSalary) {
        const hoursInput = mainRow.querySelector('.hours-input');
        hoursInput.addEventListener('input', () => {
            updateValues(parseFloat(hoursInput.value) || 0);
            updatePayrollTotal(); 
        });
    }

    mainRow.addEventListener('click', (e) => {

        if (e.target.tagName === 'INPUT' || e.target.closest('.view-check-btn')) return;
        
        dedRow.classList.toggle('hidden');
        mainRow.classList.toggle('expanded');
    });

    fragment.appendChild(mainRow);
    fragment.appendChild(dedRow);

    return fragment;
}