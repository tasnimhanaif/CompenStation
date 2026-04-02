// Everything that happens on the Settings page of the admin

// ─── Number-only enforcement for percentage inputs ────────────────────────────
document.querySelectorAll("#benefitPercentageInput, #stateTaxPercentageInput, #federalTaxPercentageInput").forEach(input => {
        input.addEventListener("input", () => {
              input.value = input.value.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1");
        });
});