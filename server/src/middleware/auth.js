import { jwtVerify } from "jose";
import { HttpError } from "./error.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const m = header.match(/^Bearer\s+(.+)$/i);
  if (!m) return next(new HttpError(401, "Missing bearer token"));

  const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");
  jwtVerify(m[1], secret, { algorithms: ["HS256"] })
    .then((result) => {
      req.jwt = result.payload;
      next();
    })
    .catch(() => next(new HttpError(401, "Invalid or expired token")));
}
