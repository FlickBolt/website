import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./types";
import { errorHandler } from "./middleware/error";
import { health } from "./routes/health";
import { auth } from "./routes/auth";
import { me } from "./routes/me";

const app = new Hono<{ Bindings: Env }>();

// CORS — allowlist from wrangler vars (comma separated).
app.use("*", async (c, next) => {
  const allowed = (c.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  return cors({
    origin: (origin) => (allowed.includes(origin) ? origin : allowed[0] || "*"),
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    maxAge: 86400,
  })(c, next);
});

app.onError(errorHandler);

app.route("/", health);
app.route("/auth", auth);
app.route("/", me);

// 404
app.notFound((c) =>
  c.json({ error: { code: "not_found", message: "Route not found" } }, 404),
);

export default app;
