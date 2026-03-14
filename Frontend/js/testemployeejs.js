
const API_BASE = "http://localhost:3000/api";

async function init() {
    const token = localStorage.getItem("token");
    if (!token) {
        console.warn("No token found. Showing demo data for John Doe.");
        return; 
    }

    try {
        const userRes = await fetch(`${API_BASE}/employee/profile`, { headers: { "Authorization": `Bearer ${token}` } });
        const user = await userRes.json();
        const tsRes = await fetch(`${API_BASE}/employee/timesheets`, { headers: { "Authorization": `Bearer ${token}` } });
        const ts = await tsRes.json();
        renderUI(user, ts[0]);
    } catch (err) {
        console.error("Backend offline. Dashboard running in Demo Mode.");
    }
}

function renderUI(user, latestTS) {
    document.getElementById('navName').innerText = user.fullName;
    document.getElementById('profileName').innerText = user.fullName;
    
    const initials = user.fullName.split(' ').map(n => n[0]).join('');
    document.getElementById('navInitials').innerText = initials;
    document.getElementById('profileInitials').innerText = initials;
    
    document.getElementById('infoEmail').innerText = user.email;
    document.getElementById('infoPhone').innerText = user.phone || "(N/A)";
    document.getElementById('infoAddress').innerText = user.address || "Update Address";
    
    const hours = latestTS ? latestTS.hoursWorked : 0;
    const gross = hours * (user.hourlyRate || 25);
    document.getElementById('calcHours').innerText = `${hours} hours`;
    document.getElementById('calcGross').innerText = `$${gross.toFixed(2)}`;
    document.getElementById('calcNet').innerText = `$${(gross * 0.7).toFixed(2)}`;
}

function toggleModal(id, show) {
    document.getElementById(id).classList.toggle('active', show);
}

function generateFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    showToast(`${filename} downloaded successfully!`);
}

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

function showToast(msg) {
    const t = document.getElementById('toast');
    document.getElementById('toastText').innerText = msg;
    t.style.display = 'flex';
    setTimeout(() => t.style.display = 'none', 3500);
}

init();