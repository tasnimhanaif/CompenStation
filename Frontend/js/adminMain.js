// Main functionality of the admin account

// API base URL — reads from a global window.APP_CONFIG if set (injected by server),
// otherwise falls back to the same origin so the frontend talks to whatever port
// the backend is actually running on.
const API = (window.APP_CONFIG && window.APP_CONFIG.API_URL)
  ? window.APP_CONFIG.API_URL
      : `${window.location.protocol}//${window.location.hostname}:3000`;

// ─── Page Navigation ─────────────────────────────────────────────────────────
const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll(".nav-link");
const screenName = document.querySelector("#screen");

function showPage(id) {
      pages.forEach(page => page.style.display = "none");
      document.getElementById(id).style.display = "flex";
}

function setActiveLink(activeLink) {
      navLinks.forEach(l => {
            l.classList.remove("active");
            const img = l.querySelector("img");
            if (img) img.src = img.src.replace("_light.svg", "_dark.svg");
      });
      activeLink.classList.add("active");
      const img = activeLink.querySelector("img");
      if (img) img.src = img.src.replace("_dark.svg", "_light.svg");
}

navLinks.forEach(link => {
      link.addEventListener("click", (e) => {
            e.preventDefault();
            const target = link.dataset.target;
            showPage(target);
            setActiveLink(link);
            if (target === "employees") loadEmployees();
            if (target === "settings") loadSettings();
            screenName.textContent = e.target.textContent;
      });
});

// Show dashboard by default
showPage("dashboard");
setActiveLink(document.querySelector('[data-target="dashboard"]'));
