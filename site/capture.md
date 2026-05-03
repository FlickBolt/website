---
layout: default
title: Capture
permalink: /capture/
scripts:
  - /assets/js/pages/capture.js
---
<section class="mx-auto max-w-3xl px-4 py-10">
  <h1 class="text-3xl font-semibold">Capture</h1>
  <p class="text-zinc-400 mt-2">Go online to receive paid jobs nearby, or broadcast live publicly for tips.</p>

  <div class="mt-8 grid md:grid-cols-2 gap-4">
    <div class="card">
      <h2 class="font-semibold">Dispatch</h2>
      <p class="text-sm text-zinc-400 mt-2">When you're online, nearby requests appear here in real time.</p>
      <button id="go-online" class="mt-4 btn btn-primary">Go online</button>
      <ul id="offers" class="mt-4 space-y-2 text-sm text-zinc-300"></ul>
    </div>
    <div class="card">
      <h2 class="font-semibold">Live</h2>
      <p class="text-sm text-zinc-400 mt-2">Start a public broadcast right now. Viewers can tip and subscribe.</p>
      <button id="go-live" class="mt-4 btn btn-ghost">Go live</button>
    </div>
  </div>
</section>
