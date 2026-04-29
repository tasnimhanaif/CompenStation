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