---
layout: default
title: Watch live
permalink: /live/watch/
sitemap: false
scripts:
  - /assets/js/pages/live-watch.js
---
<section class="mx-auto max-w-6xl px-4 py-6 grid lg:grid-cols-[1fr_320px] gap-6">
  <div>
    <div id="player" class="aspect-video bg-black rounded-xl"></div>
    <div class="mt-4">
      <h1 id="stream-title" class="text-xl font-semibold">Loading…</h1>
      <p id="stream-meta" class="text-sm text-zinc-400 mt-1"></p>
      <div class="mt-4 flex gap-2">
        <button id="tip" class="btn btn-primary">Tip</button>
        <button id="subscribe" class="btn btn-ghost">Subscribe</button>
      </div>
    </div>
  </div>
  <aside class="card flex flex-col h-[480px]">
    <h2 class="font-semibold mb-2">Chat</h2>
    <div id="chat-log" class="flex-1 overflow-y-auto text-sm space-y-1"></div>
    <form id="chat-form" class="mt-2 flex gap-2">
      <input id="chat-input" class="input" placeholder="Say something…">
      <button class="btn btn-primary">Send</button>
    </form>
  </aside>
</section>
<script>
  // Static-host friendly: the channel handle is read from ?h=...
  // Example: /live/watch/?h=alice
  window.FB_PAGE = { handle: new URLSearchParams(location.search).get("h") || "" };
</script>
