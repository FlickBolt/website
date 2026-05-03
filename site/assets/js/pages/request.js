// Placeholder estimator — wired to /requests/estimate in Phase 5.
const form = document.getElementById("request-form");
const est = document.getElementById("estimate");
function refreshEstimate() {
  const dur = parseInt(document.getElementById("duration").value, 10);
  const px = 5 + Math.round(dur / 15);
  est.textContent = "$" + px.toFixed(2);
}
form.addEventListener("input", refreshEstimate);
refreshEstimate();
form.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Phase 5 wires this to /requests + Stripe checkout.");
});
