/* Tiny observable store. No deps. */
(function () {
  const listeners = new Set();
  const state = {
    user: null,
    accessToken: null,
    refreshToken: null,
    ready: false,
  };
  function get() { return state; }
  function set(patch) {
    Object.assign(state, patch);
    for (const fn of listeners) {
      try { fn(state); } catch (e) { console.error(e); }
    }
  }
  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }
  window.FB_Store = { get, set, subscribe };
})();
