(async function () {
  const el = document.getElementById("requests");
  try {
    const rows = await window.FB_Api.get("/requests/mine");
    if (!rows.length) {
      el.innerHTML = '<div class="card text-zinc-500">No requests yet. <a class="text-amber-400" href="/request/">Create one</a>.</div>';
      return;
    }
    el.innerHTML = rows.map(r => `
      <div class="card flex justify-between gap-4">
        <div>
          <div class="font-medium">${r.address || "—"}</div>
          <div class="text-sm text-zinc-400">${r.instructions?.slice(0,80) || ""}</div>
        </div>
        <div class="text-sm text-zinc-300">${r.status}</div>
      </div>
    `).join("");
  } catch {
    el.innerHTML = '<div class="card text-zinc-500">Sign in to see your requests.</div>';
  }
})();
