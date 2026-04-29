// Everything that happens on the Settings page of the admin

// ─── Number-only enforcement for percentage inputs ────────────────────────────
document.querySelectorAll("#benefitPercentageInput, #stateTaxPercentageInput, #federalTaxPercentageInput").forEach(input => {
        input.addEventListener("input", () => {
              input.value = input.value.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1");
        });
});

const fedTaxInput = document.querySelector("#federalTaxPercentageInput");
const addFedTaxBtn = document.querySelector("#addFederalTaxBtn");
addFedTaxBtn.addEventListener("click", () => {
    if (fedTaxInput.value) {

    } else {
        console.log(`${fedTaxInput.id} has no input`);
    }
})

const benefitsList = document.querySelector("#benefitsList");
function createBenefitRow(benefit) {
      const listItem = document.createElement("li");
      listItem.className = "benefits-list-item";
      listItem.textContent = benefit.name;
      return listItem;
}

function loadSampleBenefits() {
      benefitsList.innerHTML = '';
      benefits.forEach(benefit => {
            benefitsList.appendChild(createBenefitRow(benefit));
      });
}
document.addEventListener('DOMContentLoaded', () => {
      loadSampleBenefits();
});

benefitsList.addEventListener("click", (e) => {
  const item = e.target.closest(".benefits-list-item");
  if (!item) return;
  benefitsList.querySelectorAll(".benefits-list-item").forEach(i => i.classList.remove("active"));
  item.classList.add("active");
});