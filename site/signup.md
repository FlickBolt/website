---
layout: default
title: Sign up
permalink: /signup/
scripts:
  - /assets/js/pages/signup.js
---
<section class="mx-auto max-w-md px-4 py-12">
  <h1 class="text-2xl font-semibold">Create your account</h1>
  <form id="signup-form" class="mt-6 space-y-4">
    <div>
      <label class="label" for="display_name">Display name</label>
      <input id="display_name" name="display_name" required class="input">
    </div>
    <div>
      <label class="label" for="email">Email</label>
      <input id="email" name="email" type="email" required class="input">
    </div>
    <div>
      <label class="label" for="password">Password</label>
      <input id="password" name="password" type="password" required minlength="8" class="input">
    </div>
    <div>
      <label class="label" for="role">I want to</label>
      <select id="role" name="role" class="input">
        <option value="customer">Request videos</option>
        <option value="capturer">Capture videos</option>
        <option value="both">Both</option>
      </select>
    </div>
    <button class="btn btn-primary w-full">Create account</button>
    <p id="signup-error" class="text-sm text-red-400 text-center hidden"></p>
  </form>
</section>
