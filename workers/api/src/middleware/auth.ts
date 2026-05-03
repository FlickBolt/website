import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { verify } from "hono/jwt";
import type { Env, JwtPayload } from "../types";

export async function requireAuth(c: Context<{ Bindings: Env; Variables: { jwt: JwtPayload } }>, next: Next) {
  const auth = c.req.header("Authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) throw new HTTPException(401, { message: "Missing bearer token" });
  try {
    const payload = (await verify(m[1], c.env.JWT_SECRET, "HS256")) as unknown as JwtPayload;
    c.set("jwt", payload);
  } catch {
    throw new HTTPException(401, { message: "Invalid or expired token" });
  }
  await next();
}

export function requireRole(...roles: JwtPayload["role"][]) {
  return async (c: Context<{ Bindings: Env; Variables: { jwt: JwtPayload } }>, next: Next) => {
    const jwt = c.get("jwt");
    if (!jwt || !roles.includes(jwt.role)) {
      throw new HTTPException(403, { message: "Forbidden" });
    }
    await next();
  };
}
