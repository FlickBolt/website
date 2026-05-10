const store = new Map();
const timers = new Map();

export const kv = {
  get(key) {
    const entry = store.get(key);
    if (!entry) return null;
    if (entry.expires && Date.now() > entry.expires) {
      store.delete(key);
      return null;
    }
    return entry.value;
  },
  put(key, value, { expirationTtl } = {}) {
    if (timers.has(key)) clearTimeout(timers.get(key));
    const expires = expirationTtl ? Date.now() + expirationTtl * 1000 : null;
    store.set(key, { value, expires });
    if (expirationTtl) {
      const t = setTimeout(() => store.delete(key), expirationTtl * 1000);
      t.unref?.();
      timers.set(key, t);
    }
  },
  delete(key) {
    if (timers.has(key)) clearTimeout(timers.get(key));
    timers.delete(key);
    store.delete(key);
  },
};
