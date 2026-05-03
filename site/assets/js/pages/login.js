document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const err = document.getElementById("login-error");
  err.classList.add("hidden");
  try {
    const data = await window.FB_Api.post("/auth/login", {
      email: fd.get("email"),
      password: fd.get("password"),
    });
    window.FB_Auth.setTokens(data);
    location.href = "/dashboard/customer/";
  } catch (e) {
    err.textContent = e.message || "Login failed";
    err.classList.remove("hidden");
  }
});
