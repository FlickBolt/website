---
layout: default
title: Log in
permalink: /login/
scripts:
  - /assets/js/pages/login.js
---
<section class="mx-auto max-w-md px-4 py-12">
  <h1 class="text-2xl font-semibold">Welcome back</h1>
  <form id="login-form" class="mt-6 space-y-4">
    <div>
      <label class="label" for="email">Email</label>
      <input id="email" name="email" type="email" required class="input">
    </div>
    <div>
      <label class="label" for="password">Password</label>
      <input id="password" name="password" type="password" required class="input">
    </div>
    <button class="btn btn-primary w-full">Log in</button>
    <p class="text-sm text-zinc-400 text-center">No account? <a href="/signup/" class="text-amber-400">Sign up</a></p>
    <p id="login-error" class="text-sm text-red-400 text-center hidden"></p>
  </form>
</section>
