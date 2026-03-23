// Everything that happens on the Settings page of the admin

// ─── Settings: Benefits Panel ─────────────────────────────────────────────────
function renderSettingsBenefits() {
      const list = document.getElementById("benefitsList");
      list.innerHTML = "";
      benefits.forEach((benefit, index) => {
              const li = document.createElement("li");
              li.className = "list-item";
              li.innerHTML = `<span>${benefit.name}</span><button class="remove"><img src="icons/close_light.svg" alt="remove"></button>`;
              li.addEventListener("click", () => {
                        list.querySelectorAll(".list-item").forEach(i => i.classList.remove("selected"));
                        li.classList.add("selected");
                        document.getElementById("benefitNameInput").value = benefit.name;
                        document.getElementById("benefitPercentageInput").value = benefit.percentage;
              });
              li.querySelector(".remove").addEventListener("click", async (e) => {
                        e.stopPropagation();
                        benefits.splice(index, 1);
                        renderSettingsBenefits();
                        try {
                                    const response = await fetch(`${API}/settings/benefits/${index}`, { method: "DELETE" });
                                    if (!response.ok) throw new Error(`Failed to remove benefit: ${response.status}`);
                        } catch (err) {
                                    console.error("Failed to remove benefit:", err);
                        }
              });
              list.appendChild(li);
      });
}

// ─── Settings: State Tax Panel ────────────────────────────────────────────────
function renderStateTaxes() {
      const list = document.getElementById("stateTaxList");
      list.innerHTML = "";
      stateTaxes.forEach((tax, index) => {
              const li = document.createElement("li");
              li.className = "list-item";
              li.innerHTML = `<span>${tax}%</span><button class="remove"><img src="icons/close_light.svg" alt="remove"></button>`;
              li.addEventListener("click", () => {
                        list.querySelectorAll(".list-item").forEach(i => i.classList.remove("selected"));
                        li.classList.add("selected");
                        document.getElementById("stateTaxPercentageInput").value = tax;
              });
              li.querySelector(".remove").addEventListener("click", (e) => {
                        e.stopPropagation();
                        stateTaxes.splice(index, 1);
                        renderStateTaxes();
              });
              list.appendChild(li);
      });
}

// ─── Settings: Federal Tax Panel ──────────────────────────────────────────────
function renderFederalTaxes() {
      const list = document.getElementById("federalTaxList");
      list.innerHTML = "";
      federalTaxes.forEach((tax, index) => {
              const li = document.createElement("li");
              li.className = "list-item";
              li.innerHTML = `<span>${tax}%</span><button class="remove"><img src="icons/close_light.svg" alt="remove"></button>`;
              li.addEventListener("click", () => {
                        list.querySelectorAll(".list-item").forEach(i => i.classList.remove("selected"));
                        li.classList.add("selected");
                        document.getElementById("federalTaxPercentageInput").value = tax;
              });
              li.querySelector(".remove").addEventListener("click", (e) => {
                        e.stopPropagation();
                        federalTaxes.splice(index, 1);
                        renderFederalTaxes();
              });
              list.appendChild(li);
      });
}

// ─── API: Load Settings from Backend ─────────────────────────────────────────
async function loadSettings() {
      try {
              const [benefitsRes, stateTaxRes, federalTaxRes] = await Promise.all([
                        fetch(`${API}/settings/benefits`),
                        fetch(`${API}/settings/taxes/state`),
                        fetch(`${API}/settings/taxes/federal`),
                      ]);
              if (benefitsRes.ok) {
                        const apibenefits = await benefitsRes.json();
                        if (Array.isArray(apibenefits) && apibenefits.length > 0) {
                                    benefits.length = 0;
                                    apibenefits.forEach(b => benefits.push(b));
                        }
              }
              if (stateTaxRes.ok) {
                        const apiStateTaxes = await stateTaxRes.json();
                        if (Array.isArray(apiStateTaxes) && apiStateTaxes.length > 0) {
                                    stateTaxes.length = 0;
                                    apiStateTaxes.forEach(t => stateTaxes.push(t));
                        }
              }
              if (federalTaxRes.ok) {
                        const apiFederalTaxes = await federalTaxRes.json();
                        if (Array.isArray(apiFederalTaxes) && apiFederalTaxes.length > 0) {
                                    federalTaxes.length = 0;
                                    apiFederalTaxes.forEach(t => federalTaxes.push(t));
                        }
              }
      } catch (err) {
              console.error("Failed to load settings:", err);
      }
      renderSettingsBenefits();
      renderStateTaxes();
      renderFederalTaxes();
}

// ─── Number-only enforcement for percentage inputs ────────────────────────────
document.querySelectorAll("#benefitPercentageInput, #stateTaxPercentageInput, #federalTaxPercentageInput").forEach(input => {
      input.addEventListener("input", () => {
              input.value = input.value.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1");
      });
});

// Populate settings on load
renderSettingsBenefits();
renderStateTaxes();
renderFederalTaxes();

// ─── Settings: Add Benefit ────────────────────────────────────────────────────
document.getElementById("addBenefitBtn").addEventListener("click", async () => {
      const name = document.getElementById("benefitNameInput").value.trim();
      const percentage = parseFloat(document.getElementById("benefitPercentageInput").value);
      if (!name || isNaN(percentage)) return;
      benefits.push({ name, percentage });
      renderSettingsBenefits();
      document.getElementById("benefitNameInput").value = "";
      document.getElementById("benefitPercentageInput").value = "";
      try {
              const response = await fetch(`${API}/settings/benefits`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name, percentage }),
              });
              if (!response.ok) throw new Error(`Failed to add benefit: ${response.status}`);
      } catch (err) {
              console.error("Failed to add benefit:", err);
      }
});

// ─── Settings: Add State Tax ──────────────────────────────────────────────────
document.getElementById("addStateTaxBtn").addEventListener("click", async () => {
      const percentage = parseFloat(document.getElementById("stateTaxPercentageInput").value);
      if (isNaN(percentage)) return;
      stateTaxes.push(percentage);
      renderStateTaxes();
      document.getElementById("stateTaxPercentageInput").value = "";
      try {
              const response = await fetch(`${API}/settings/taxes/state`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ percentage }),
              });
              if (!response.ok) throw new Error(`Failed to add state tax: ${response.status}`);
      } catch (err) {
              console.error("Failed to add state tax:", err);
      }
});

// ─── Settings: Add Federal Tax ────────────────────────────────────────────────
document.getElementById("addFederalTaxBtn").addEventListener("click", async () => {
      const percentage = parseFloat(document.getElementById("federalTaxPercentageInput").value);
      if (isNaN(percentage)) return;
      federalTaxes.push(percentage);
      renderFederalTaxes();
      document.getElementById("federalTaxPercentageInput").value = "";
      try {
              const response = await fetch(`${API}/settings/taxes/federal`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ percentage }),
              });
              if (!response.ok) throw new Error(`Failed to add federal tax: ${response.status}`);
      } catch (err) {
              console.error("Failed to add federal tax:", err);
      }
});
