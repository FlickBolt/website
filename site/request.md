---
layout: default
title: Request a video
permalink: /request/
scripts:
  - /assets/js/pages/request.js
---
<section class="mx-auto max-w-3xl px-4 py-10">
  <h1 class="text-3xl font-semibold">Request a video</h1>
  <p class="text-zinc-400 mt-2">Three steps: where, what, how much.</p>

  <form id="request-form" class="mt-8 space-y-8">
    <div class="card">
      <h2 class="font-semibold">1. Where</h2>
      <div class="mt-3">
        <label class="label" for="address">Address or place</label>
        <input id="address" name="address" class="input" placeholder="e.g. 1 Times Square, NY">
      </div>
      <div id="map" class="mt-3 h-56 rounded-lg bg-zinc-800 grid place-items-center text-zinc-500 text-xs">map placeholder</div>
    </div>

    <div class="card">
      <h2 class="font-semibold">2. What</h2>
      <label class="label mt-3" for="instructions">Instructions</label>
      <textarea id="instructions" name="instructions" rows="4" class="input" placeholder="Pan from north to south, capture the storefront sign, ~60s"></textarea>
      <div class="grid grid-cols-2 gap-3 mt-3">
        <div>
          <label class="label" for="duration">Duration</label>
          <select id="duration" class="input">
            <option value="30">30 seconds</option>
            <option value="60" selected>60 seconds</option>
            <option value="180">3 minutes</option>
          </select>
        </div>
        <div>
          <label class="label" for="window">When</label>
          <select id="window" class="input">
            <option value="now">As soon as possible</option>
            <option value="hour">Within 1 hour</option>
            <option value="scheduled">Schedule…</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="font-semibold">3. How much</h2>
      <div class="grid grid-cols-2 gap-3 mt-3">
        <div>
          <label class="label" for="max_price">Max price (USD)</label>
          <input id="max_price" type="number" min="5" step="1" value="25" class="input">
        </div>
        <div class="flex items-end text-sm text-zinc-400">Estimated: <span id="estimate" class="ml-2 text-zinc-100 font-medium">—</span></div>
      </div>
      <label class="mt-3 flex items-start gap-2 text-sm text-zinc-300">
        <input type="checkbox" required class="mt-1">
        <span>I confirm I'm not requesting filming of private property without permission, identifiable people without basis, or any illegal activity.</span>
      </label>
    </div>

    <button type="submit" class="btn btn-primary">Continue to payment</button>
  </form>
</section>
