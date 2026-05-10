import { Router } from "express";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { db } from "../db.js";
import { kv } from "../kv.js";
import { HttpError } from "../middleware/error.js";

export const auth = Router();

const ACCESS_TTL = 60 * 15;
const REFRESH_TTL = 60 * 60 * 24 * 30;

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");
}

async function issueTokens(userId, role) {
  const now = Math.floor(Date.now() / 1000);
  const accessToken = await new SignJWT({ sub: userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(now + ACCESS_TTL)
    .sign(getSecret());

  const refreshToken = crypto.randomUUID();
  kv.put(`rt:${refreshToken}`, JSON.stringify({ userId, role }), {
    expirationTtl: REFRESH_TTL,
  });

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: "Bearer",
    expires_in: ACCESS_TTL,
  };
}

auth.post("/auth/signup", async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.email || !body.password || !body.display_name) {
      return next(new HttpError(400, "email, password, display_name required"));
    }
    if (body.password.length < 8) {
      return next(new HttpError(400, "password must be at least 8 characters"));
    }

    const role =
      body.role === "capturer" || body.role === "both" || body.role === "customer"
        ? body.role
        : "customer";

    const existing = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(body.email.toLowerCase());
    if (existing) return next(new HttpError(409, "Email already registered"));

    const id = crypto.randomUUID();
    const hash = await bcrypt.hash(body.password, 10);
    const handle =
      body.display_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 32) +
      "-" +
      id.slice(0, 4);

    db.prepare(
      `INSERT INTO users (id, email, password_hash, role, display_name, handle, created_at)
       VALUES (?, ?, ?, ?, ?, ?, strftime('%s','now'))`,
    ).run(id, body.email.toLowerCase(), hash, role, body.display_name, handle);

    const tokens = await issueTokens(id, role);
    return res.status(201).json({
      ...tokens,
      user: {
        id,
        email: body.email.toLowerCase(),
        role,
        display_name: body.display_name,
        handle,
      },
    });
  } catch (err) {
    next(err);
  }
});

auth.post("/auth/login", async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.email || !body.password) {
      return next(new HttpError(400, "email and password required"));
    }

    const row = db
      .prepare("SELECT id, password_hash, role FROM users WHERE email = ?")
      .get(body.email.toLowerCase());
    if (!row) return next(new HttpError(401, "Invalid email or password"));

    const ok = await bcrypt.compare(body.password, row.password_hash);
    if (!ok) return next(new HttpError(401, "Invalid email or password"));

    const tokens = await issueTokens(row.id, row.role);
    return res.json(tokens);
  } catch (err) {
    next(err);
  }
});

auth.post("/auth/refresh", async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.refresh_token) return next(new HttpError(400, "refresh_token required"));

    const raw = kv.get(`rt:${body.refresh_token}`);
    if (!raw) return next(new HttpError(401, "Invalid or expired refresh token"));

    const { userId, role } = JSON.parse(raw);
    kv.delete(`rt:${body.refresh_token}`);
    const tokens = await issueTokens(userId, role);
    return res.json(tokens);
  } catch (err) {
    next(err);
  }
});

auth.post("/auth/logout", async (req, res, next) => {
  try {
    const body = req.body || {};
    if (body.refresh_token) kv.delete(`rt:${body.refresh_token}`);
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
