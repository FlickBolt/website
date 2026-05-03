import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { Env, JwtPayload } from "../types";
import { requireAuth } from "../middleware/auth";

export const me = new Hono<{ Bindings: Env; Variables: { jwt: JwtPayload } }>();

me.get("/me", requireAuth, async (c) => {
  const jwt = c.get("jwt");
  const row = await c.env.DB.prepare(
    `SELECT u.id, u.email, u.role, u.display_name, u.handle, u.avatar_url, u.created_at,
            cp.kyc_status, cp.is_online
     FROM users u
     LEFT JOIN capturer_profiles cp ON cp.user_id = u.id
     WHERE u.id = ?`,
  )
    .bind(jwt.sub)
    .first();
  if (!row) throw new HTTPException(404, { message: "User not found" });
  return c.json(row);
});
