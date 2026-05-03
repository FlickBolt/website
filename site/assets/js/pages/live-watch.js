// Phase 9 — wires Cloudflare Stream player and LiveChannelDO chat.
const handle = (window.FB_PAGE && window.FB_PAGE.handle) || "";
if (!handle) {
  document.getElementById("stream-title").textContent = "No channel selected";
  document.getElementById("stream-meta").textContent = "Add ?h=<handle> to the URL or pick one from /live/.";
} else {
  document.getElementById("stream-title").textContent = "@" + handle;
  document.getElementById("stream-meta").textContent = "Live broadcast (player not yet wired)";
}
