const API_BASE = "http://localhost:3000/api";

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
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ planIds: selectedPlans })
        });
        const result = await response.json();
        updateDashboardFromBackend(result);
        toggleModal('benefitsModal', false);
        showToast('Benefits enrollment saved!');
    } catch (err) {
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

// --- 4. INITIALIZATION ---
function renderUI(user, latestTS) {
    document.getElementById('navName').innerText = user.fullName;
    document.getElementById('profileName').innerText = user.fullName;
    const initials = user.fullName.split(' ').map(n => n[0]).join('');
    document.getElementById('navInitials').innerText = initials;
    document.getElementById('profileInitials').innerText = initials;
}

async function init() {
    const token = localStorage.getItem("token");
    if (!token) return;
    // ... fetch calls ...
}




function toggleDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
}

// Handle the logout
function logout() {
    localStorage.removeItem("token"); // Clear the login session
    window.location.href = "index.html"; // Redirect to login
}


window.onclick = function(event) {
    if (!event.target.closest('.user-nav')) {
        document.getElementById('userDropdown').style.display = 'none';
    }
}









init();