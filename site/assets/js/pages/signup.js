document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const err = document.getElementById("signup-error");
  err.classList.add("hidden");
  try {
    const data = await window.FB_Api.post("/auth/signup", {
      display_name: fd.get("display_name"),
      email: fd.get("email"),
      password: fd.get("password"),
      role: fd.get("role"),
    });
    window.FB_Auth.setTokens(data);
    location.href = "/onboarding/capturer/";
  } catch (e) {
    err.textContent = e.message || "Sign up failed";
    err.classList.remove("hidden");
  }
});
