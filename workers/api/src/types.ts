export interface Env {
  // Bindings
  DB: D1Database;
  KV: KVNamespace;
  MEDIA: R2Bucket;
  // MATCHING: DurableObjectNamespace;        // wired in Phase 6
  // LIVE_CHANNEL: DurableObjectNamespace;    // wired in Phase 9

  // Vars
  ALLOWED_ORIGINS: string;
  ENVIRONMENT: string;

  // Secrets
  JWT_SECRET: string;
  STRIPE_SECRET?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STREAM_API_TOKEN?: string;
  CF_ACCOUNT_ID?: string;
  RESEND_API_KEY?: string;
  TURNSTILE_SECRET?: string;
}

export type UserRole = "customer" | "capturer" | "both" | "admin";

export interface JwtPayload {
  sub: string;
  role: UserRole;
  exp: number;
}
