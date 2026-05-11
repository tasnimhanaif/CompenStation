// Main functionality of the admin account

// API base URL — read from global APP_CONFIG if available, otherwise use localhost for local/dev environments.
const API = (() => {
      const localHosts = ["localhost", "127.0.0.1", "::1", "0.0.0.0"];
      const isLocalHost = window.location.protocol === 'file:'
            || !window.location.hostname
            || localHosts.includes(window.location.hostname);
      if (window.APP_CONFIG && window.APP_CONFIG.API_URL) return window.APP_CONFIG.API_URL;
      return isLocalHost ? 'http://localhost:3000' : '/api';
})();

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
