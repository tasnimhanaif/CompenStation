// employee.js — Employee-facing page logic

// API base: use the same dynamic resolution as adminMain.js
const API_BASE = (() => {
      const localHosts = ["localhost", "127.0.0.1", "::1", "0.0.0.0"];
      const isLocalHost = window.location.protocol === 'file:'
            || !window.location.hostname
            || localHosts.includes(window.location.hostname);
      if (window.APP_CONFIG && window.APP_CONFIG.API_URL) return window.APP_CONFIG.API_URL;
      return isLocalHost ? 'http://localhost:3000' : '/api';
})();

// --- 1. UI HELPERS (Buttons) ---
function generateFile(filename, content) {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      showToast(`${filename} downloaded successfully!`);
}

function showToast(msg) {
      const t = document.getElementById('toast');
      document.getElementById('toastText').innerText = msg;
      t.style.display = 'flex';
      setTimeout(() => t.style.display = 'none', 3500);
}

function toggleModal(id, show) {
      document.getElementById(id).classList.toggle('active', show);
}

// --- 2. FORM ACTIONS ---
function saveInfo() {
      document.getElementById('infoAddress').innerText = document.getElementById('upAddress').value;
      document.getElementById('infoPhone').innerText = document.getElementById('upPhone').value;
      document.getElementById('infoBank').innerText = document.getElementById('upBank').value;
      toggleModal('updateInfoModal', false);
      showToast('Personal Information Updated!');
}

function submitLeave() {
      toggleModal('timeOffModal', false);
      showToast('Time off request submitted.');
}

// --- 3. BENEFITS LOGIC ---
function populateBenefits(options) {
      const container = document.getElementById('benefitsContainer');
      if (!container) return;
      container.innerHTML = options.map(opt => `
          <div style="margin-bottom: 8px;">
                <input type="checkbox" value="${opt.id}" data-cost="${opt.cost}" onchange="updatePricePreview()">
                      ${opt.name} ($${opt.cost}/mo)
                          </div>
                            `).join('');
}

function updatePricePreview() {
      const total = Array.from(document.querySelectorAll('#benefitsContainer input:checked'))
        .reduce((sum, cb) => sum + parseFloat(cb.dataset.cost), 0);
      document.getElementById('pricePreview').innerText = `$${total.toFixed(2)}`;
}

async function submitBenefits() {
      const token = localStorage.getItem("token");
      const selectedPlans = Array.from(document.querySelectorAll('#benefitsContainer input:checked')).map(cb => cb.value);
      try {
              const response = await fetch(`${API_BASE}/employee/benefits`, {
                        method: 'POST',
                        headers: {
                                    "Authorization": `Bearer ${token}`,
                                    "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ planIds: selectedPlans })
              });
              if (!response.ok) throw new Error(`Failed to enroll benefits: ${response.status}`);
              const result = await response.json();
              updateDashboardFromBackend(result);
              toggleModal('benefitsModal', false);
              showToast('Benefits enrollment saved!');
      } catch (err) {
              console.error("Error saving benefits:", err);
              showToast("Error saving benefits.");
      }
}

function updateDashboardFromBackend(data) {
      if (data.newGross) document.getElementById('calcGross').innerText = `$${data.newGross.toFixed(2)}`;
      if (data.newNet) document.getElementById('calcNet').innerText = `$${data.newNet.toFixed(2)}`;
      if (data.benefitsDeduction > 0) {
              document.getElementById('benefitsRow').style.display = 'flex';
              document.getElementById('calcBenefits').innerText = `-$${data.benefitsDeduction.toFixed(2)}`;
      }
}

// --- 4. TIMESHEETS ---
async function loadTimesheets(employeeId) {
      try {
              const response = await fetch(`${API_BASE}/timesheets/employee/${employeeId}`);
              if (!response.ok) throw new Error(`Failed to load timesheets: ${response.status}`);
              const timesheets = await response.json();
              return timesheets;
      } catch (err) {
              console.error("Failed to load timesheets:", err);
              return [];
      }
}

async function submitTimesheet(employeeId, periodStart, periodEnd, hoursWorked, notes = "") {
      try {
              const response = await fetch(`${API_BASE}/timesheets`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ employeeId, periodStart, periodEnd, hoursWorked, notes }),
              });
              if (!response.ok) throw new Error(`Failed to submit timesheet: ${response.status}`);
              const ts = await response.json();
              showToast("Timesheet submitted!");
              return ts;
      } catch (err) {
              console.error("Failed to submit timesheet:", err);
              showToast("Error submitting timesheet.");
      }
}

// --- 5. INITIALIZATION ---
function renderUI(user) {
      if (!user) return;
      if (document.getElementById('navName')) document.getElementById('navName').innerText = user.fullName || "";
      if (document.getElementById('profileName')) document.getElementById('profileName').innerText = user.fullName || "";
      const initials = (user.fullName || "").split(' ').map(n => n[0]).join('');
      if (document.getElementById('navInitials')) document.getElementById('navInitials').innerText = initials;
      if (document.getElementById('profileInitials')) document.getElementById('profileInitials').innerText = initials;
}

async function init() {
      const token = localStorage.getItem("token");
      if (!token) return;

  try {
          // Decode user info from token (JWT payload) or fetch from /auth/me if available
        let user = null;
          try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    user = payload;
          } catch (e) {
                    // Token is not a JWT; skip user render
          }
          if (user) renderUI(user);

        // Load timesheets if employee ID is available
        if (user && user.employeeId) {
                  await loadTimesheets(user.employeeId);
        }
  } catch (err) {
          console.error("Initialization error:", err);
  }
}

function toggleDropdown() {
      const dropdown = document.getElementById('userDropdown');
      dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
}

function logout() {
      localStorage.removeItem("token");
      window.location.href = "index.html";
}

window.onclick = function(event) {
      if (!event.target.closest('.user-nav')) {
              const dropdown = document.getElementById('userDropdown');
              if (dropdown) dropdown.style.display = 'none';
      }
};

init();
