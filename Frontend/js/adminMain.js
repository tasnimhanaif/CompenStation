// Main functionality of the admin account
const API = 'http://localhost:3000';

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
            screenName.textContent = e.target.textContent;
      });
});

// Show dashboard by default
showPage("dashboard");
setActiveLink(document.querySelector('[data-target="dashboard"]'));
