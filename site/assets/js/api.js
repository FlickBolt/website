/* Thin fetch wrapper with auth + JSON + one-shot refresh on 401. */
(function () {
  const base = (window.FLICKBOLT && window.FLICKBOLT.apiBase) || "";

  async function call(path, opts = {}, retry = true) {
    const headers = new Headers(opts.headers || {});
    if (!headers.has("Content-Type") && opts.body && !(opts.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }
    const token = window.FB_Store && window.FB_Store.get().accessToken;
    if (token) headers.set("Authorization", "Bearer " + token);

    let body = opts.body;
    if (body && typeof body === "object" && !(body instanceof FormData) && !(body instanceof Blob)) {
      body = JSON.stringify(body);
    }

    const res = await fetch(base + path, { ...opts, headers, body });

    if (res.status === 401 && retry && window.FB_Auth && window.FB_Auth.refresh) {
      const ok = await window.FB_Auth.refresh();
      if (ok) return call(path, opts, false);
    }

    let data = null;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) data = await res.json().catch(() => null);
    else data = await res.text().catch(() => null);

    if (!res.ok) {
      const err = new Error((data && data.error && data.error.message) || res.statusText || "Request failed");
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  window.FB_Api = {
    base,
    get: (p, o) => call(p, { ...(o || {}), method: "GET" }),
    post: (p, body, o) => call(p, { ...(o || {}), method: "POST", body }),
    put: (p, body, o) => call(p, { ...(o || {}), method: "PUT", body }),
    del: (p, o) => call(p, { ...(o || {}), method: "DELETE" }),
  };
})();
