(async function () {
  const grid = document.getElementById("live-grid");
  try {
    const list = await window.FB_Api.get("/live/active");
    if (!list.length) {
      grid.innerHTML = '<div class="card text-zinc-500">Nothing live right now.</div>';
      return;
    }
    grid.innerHTML = list.map(s => `
      <a href="/live/watch/?h=${encodeURIComponent(s.handle)}" class="card hover:border-amber-400">
        <div class="aspect-video rounded-lg bg-zinc-800 mb-3"></div>
        <div class="font-medium">${s.title || s.handle}</div>
        <div class="text-xs text-zinc-400">${s.viewers || 0} watching</div>
      </a>
    `).join("");
  } catch {
    grid.innerHTML = '<div class="card text-zinc-500">Live feed offline.</div>';
  }
})();
