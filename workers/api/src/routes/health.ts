import { Hono } from "hono";
import type { Env } from "../types";

export const health = new Hono<{ Bindings: Env }>();

health.get("/health", (c) => c.json({ ok: true }));

health.get("/version", (c) =>
  c.json({
    name: "flickbolt-api",
    version: "0.1.0",
    env: c.env.ENVIRONMENT || "unknown",
    commit: (globalThis as any).__BUILD_COMMIT__ || null,
  }),
);
