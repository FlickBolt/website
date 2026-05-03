import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { sign, verify } from "hono/jwt";
import bcrypt from "bcryptjs";
import type { Env, JwtPayload, UserRole } from "../types";

export const auth = new Hono<{ Bindings: Env }>();

const ACCESS_TTL = 60 * 15; // 15 min
const REFRESH_TTL = 60 * 60 * 24 * 30; // 30 days

function uuid() {
  return crypto.randomUUID();
}

async function issueTokens(env: Env, userId: string, role: UserRole) {
  const now = Math.floor(Date.now() / 1000);
  const accessToken = await sign(
    { sub: userId, role, exp: now + ACCESS_TTL } satisfies JwtPayload,
    env.JWT_SECRET,
  );
  const refreshToken = uuid();
  await env.KV.put(`rt:${refreshToken}`, JSON.stringify({ userId, role }), {
    expirationTtl: REFRESH_TTL,
  });
  return { access_token: accessToken, refresh_token: refreshToken, token_type: "Bearer", expires_in: ACCESS_TTL };
}

auth.post("/signup", async (c) => {
  const body = await c.req.json<{
    email: string;
    password: string;
    display_name: string;
    role?: UserRole;
  }>();

  if (!body.email || !body.password || !body.display_name) {
    throw new HTTPException(400, { message: "email, password, display_name required" });
  }
  if (body.password.length < 8) {
    throw new HTTPException(400, { message: "password must be at least 8 characters" });
  }

  const role: UserRole = body.role === "capturer" || body.role === "both" || body.role === "customer"
    ? body.role
    : "customer";

  const existing = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(body.email.toLowerCase())
    .first<{ id: string }>();
  if (existing) throw new HTTPException(409, { message: "Email already registered" });

  const id = uuid();
  const hash = await bcrypt.hash(body.password, 10);
  const handle = body.display_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 32) + "-" + id.slice(0, 4);

  await c.env.DB.prepare(
    `INSERT INTO users (id, email, password_hash, role, display_name, handle, created_at)
     VALUES (?, ?, ?, ?, ?, ?, strftime('%s','now'))`,
  )
    .bind(id, body.email.toLowerCase(), hash, role, body.display_name, handle)
    .run();

  const tokens = await issueTokens(c.env, id, role);
  return c.json({ ...tokens, user: { id, email: body.email.toLowerCase(), role, display_name: body.display_name, handle } }, 201);
});

auth.post("/login", async (c) => {
  const body = await c.req.json<{ email: string; password: string }>();
  if (!body.email || !body.password) {
    throw new HTTPException(400, { message: "email and password required" });
  }
  const row = await c.env.DB.prepare(
    "SELECT id, password_hash, role FROM users WHERE email = ?",
  )
    .bind(body.email.toLowerCase())
    .first<{ id: string; password_hash: string; role: UserRole }>();

  if (!row) throw new HTTPException(401, { message: "Invalid email or password" });
  const ok = await bcrypt.compare(body.password, row.password_hash);
  if (!ok) throw new HTTPException(401, { message: "Invalid email or password" });

  const tokens = await issueTokens(c.env, row.id, row.role);
  return c.json(tokens);
});

auth.post("/refresh", async (c) => {
  const body = await c.req.json<{ refresh_token: string }>();
  if (!body.refresh_token) throw new HTTPException(400, { message: "refresh_token required" });

  const raw = await c.env.KV.get(`rt:${body.refresh_token}`);
  if (!raw) throw new HTTPException(401, { message: "Invalid or expired refresh token" });

  const { userId, role } = JSON.parse(raw) as { userId: string; role: UserRole };
  // rotate
  await c.env.KV.delete(`rt:${body.refresh_token}`);
  const tokens = await issueTokens(c.env, userId, role);
  return c.json(tokens);
});

auth.post("/logout", async (c) => {
  const body = await c.req
    .json<{ refresh_token?: string }>()
    .catch(() => ({} as { refresh_token?: string }));
  if (body.refresh_token) await c.env.KV.delete(`rt:${body.refresh_token}`);
  return c.json({ ok: true });
});

// Re-export verify for tests / debugging
export { verify };
