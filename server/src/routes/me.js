import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { db } from "../db.js";
import { HttpError } from "../middleware/error.js";

export const me = Router();

me.get("/me", requireAuth, (req, res, next) => {
  try {
    const row = db
      .prepare(
        `SELECT u.id, u.email, u.role, u.display_name, u.handle, u.avatar_url, u.created_at,
                cp.kyc_status, cp.is_online
         FROM users u
         LEFT JOIN capturer_profiles cp ON cp.user_id = u.id
         WHERE u.id = ?`,
      )
      .get(req.jwt.sub);
    if (!row) return next(new HttpError(404, "User not found"));
    return res.json(row);
  } catch (err) {
    next(err);
  }
});
