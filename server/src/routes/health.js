import { Router } from "express";

export const health = Router();

health.get("/health", (req, res) => res.json({ ok: true }));

health.get("/version", (req, res) =>
  res.json({
    name: "flickbolt-api",
    version: "0.1.0",
    env: process.env.ENVIRONMENT || "development",
    commit: null,
  }),
);
