/* Auth: hydrate tokens from localStorage, refresh, logout, header swap. */
(function () {
  const KEY_ACCESS = "fb.access";
  const KEY_REFRESH = "fb.refresh";

  function hydrate() {
    const accessToken = localStorage.getItem(KEY_ACCESS);
    const refreshToken = localStorage.getItem(KEY_REFRESH);
    window.FB_Store.set({ accessToken, refreshToken, ready: false });
  }

  async function loadMe() {
    if (!window.FB_Store.get().accessToken) {
      window.FB_Store.set({ user: null, ready: true });
      return;
    }
    try {
      const me = await window.FB_Api.get("/me");
      window.FB_Store.set({ user: me, ready: true });
    } catch (e) {
      window.FB_Store.set({ user: null, ready: true });
    }
  }

  function setTokens({ accessToken, refreshToken }) {
    if (accessToken) localStorage.setItem(KEY_ACCESS, accessToken);
    if (refreshToken) localStorage.setItem(KEY_REFRESH, refreshToken);
    window.FB_Store.set({ accessToken, refreshToken });
  }

  function clear() {
    localStorage.removeItem(KEY_ACCESS);
    localStorage.removeItem(KEY_REFRESH);
    window.FB_Store.set({ accessToken: null, refreshToken: null, user: null });
  }

  async function refresh() {
    const rt = window.FB_Store.get().refreshToken;
    if (!rt) return false;
    try {
      const res = await fetch(window.FLICKBOLT.apiBase + "/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: rt }),
      });
      if (!res.ok) throw new Error("refresh failed");
      const data = await res.json();
      setTokens(data);
      return true;
    } catch {
      clear();
      return false;
    }
  }

  async function logout() {
    const rt = window.FB_Store.get().refreshToken;
    try { await fetch(window.FLICKBOLT.apiBase + "/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: rt }),
    }); } catch {}
    clear();
    window.location.href = "/";
  }

  function renderNav(state) {
    const el = document.getElementById("nav-auth");
    if (!el) return;
    if (state.user) {
      el.innerHTML = `
        <a href="/dashboard/customer/" class="px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700">Dashboard</a>
        <button id="nav-logout" class="px-3 py-1.5 rounded-lg bg-amber-400 text-zinc-950 font-medium hover:bg-amber-300">Log out</button>
      `;
      document.getElementById("nav-logout").addEventListener("click", logout);
    }
  }

  hydrate();
  window.FB_Auth = { setTokens, clear, refresh, logout, loadMe };
  window.FB_Store.subscribe(renderNav);
  loadMe();
})();
