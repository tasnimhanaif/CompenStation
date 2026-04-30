// Everything that happens on the Settings page of the admin

// ─── Number-only enforcement for percentage inputs ────────────────────────────
document.querySelectorAll(
    "#benefitPercentageInput,\
      #stateTaxPercentageInput,\
      #federalTaxPercentageInput,\
      #stateTaxBracketStartInput,\
      #stateTaxBracketEndInput,\
      #federalTaxBracketStartInput,\
      #federalTaxBracketEndInput"
    ).forEach(input => {
        input.addEventListener("input", () => {
              input.value = input.value.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1");
        });
});

// Adding a benefit
const benefitsForm = document.querySelector("#benefitsForm");
benefitsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(benefitsForm);
    const benefitItem = Object.fromEntries(formData.entries());
    benefits.push(benefitItem);
    loadSampleBenefits();
    benefitsForm.reset();
})
// Removing a benefit
const removeBenefitBtn = document.querySelector("#removeBenefitBtn");
removeBenefitBtn.addEventListener("click", (e) => {
    e.preventDefault();
    
})

// Adding a state tax
const stateTaxForm = document.querySelector("#stateTaxForm");
stateTaxForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(stateTaxForm);
    const taxItem = Object.fromEntries(formData.entries());
    stateTaxes.push(taxItem);
    loadSampleStateTax();
    stateTaxForm.reset();
})

// Adding a federal tax
const federalTaxForm = document.querySelector("#federalTaxForm");
federalTaxForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(federalTaxForm);
    const taxItem = Object.fromEntries(formData.entries());
    federalTaxes.push(taxItem);
    loadSampleFederalTax();
    federalTaxForm.reset();
})

const benefitsList = document.querySelector("#benefitsList");
const stateTaxList = document.querySelector("#stateTaxList");
const federalTaxList = document.querySelector("#federalTaxList");
function createListItem(item, type) {
    const listItem = document.createElement("li");
    if (type == "benefitList") {
        listItem.className = "list-item";
        listItem.textContent = item.name;
    } else if (type == "stateTaxList" || type == "federalTaxList") {
        listItem.className = "list-item";
        listItem.textContent = item.percentage + " %";
    } else {
        console.log("createListItem(item, type): Invalid list item type!");
    }
    listItem.addEventListener("click", () => {
        fillSettingsForm(item, type);
    })
    return listItem;
}
function loadSampleBenefits() {
      benefitsList.innerHTML = '';
      benefits.forEach(benefit => {
            benefitsList.appendChild(createListItem(benefit, "benefitList"));
      });
}
function loadSampleStateTax() {
    stateTaxList.innerHTML = '';
    stateTaxes.forEach(stateTax => {
        stateTaxList.appendChild(createListItem(stateTax, "stateTaxList"));
    });
}
function loadSampleFederalTax() {
    federalTaxList.innerHTML = '';
    federalTaxes.forEach(federalTax => {
        federalTaxList.appendChild(createListItem(federalTax, "federalTaxList"));
    });
}
document.addEventListener('DOMContentLoaded', () => {
    loadSampleBenefits();
    loadSampleStateTax();
    loadSampleFederalTax();
});

// Handle higlighting list items on the benefits list
benefitsList.addEventListener("click", (e) => {
    const item = e.target.closest(".list-item");
    if (!item) return;
    benefitsList.querySelectorAll(".list-item").forEach(i => i.classList.remove("active"));
    item.classList.add("active");
});
// Handle higlighting list items on the state tax list
stateTaxList.addEventListener("click", (e) => {
    const item = e.target.closest(".list-item");
    if (!item) return;
    stateTaxList.querySelectorAll(".list-item").forEach(i => i.classList.remove("active"));
    item.classList.add("active");
});
// Handle higlighting list items on the federal tax list
federalTaxList.addEventListener("click", (e) => {
    const item = e.target.closest(".list-item");
    if (!item) return;
    federalTaxList.querySelectorAll(".list-item").forEach(i => i.classList.remove("active"));
    item.classList.add("active");
});
function fillSettingsForm(item, type) {
    if (type === "benefitList") {
        document.getElementById("benefitPercentageInput").value = item.percentage ?? '';
        document.getElementById("benefitNameInput").value = item.name ?? '';
    } else if (type === "stateTaxList") {
        document.getElementById("stateTaxPercentageInput").value = item.percentage ?? '';
        document.getElementById("stateTaxBracketStartInput").value = item.bracketStart ?? '';
        document.getElementById("stateTaxBracketEndInput").value = item.bracketEnd ?? '';
    } else if (type === "federalTaxList") {
        document.getElementById("federalTaxPercentageInput").value = item.percentage ?? '';
        document.getElementById("federalTaxBracketStartInput").value = item.bracketStart ?? '';
        document.getElementById("federalTaxBracketEndInput").value = item.bracketEnd ?? '';
    }
}