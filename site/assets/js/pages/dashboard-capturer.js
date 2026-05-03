(async function () {
  try {
    const me = await window.FB_Api.get("/me");
    document.getElementById("cap-status").textContent =
      me.kyc_status === "verified" ? "Verified, ready to go online." : "KYC pending — finish onboarding.";
  } catch {
    document.getElementById("cap-status").textContent = "Sign in to view your status.";
  }
})();
