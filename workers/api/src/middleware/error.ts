import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

export function errorHandler(err: Error, c: Context) {
  if (err instanceof HTTPException) {
    return c.json(
      { error: { code: httpCode(err.status), message: err.message || "Request failed" } },
      err.status,
    );
  }
  console.error("[unhandled]", err.stack || err.message);
  return c.json(
    { error: { code: "internal_error", message: "Something went wrong" } },
    500,
  );
}

function httpCode(status: number): string {
  if (status === 400) return "bad_request";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 422) return "unprocessable";
  if (status === 429) return "rate_limited";
  return "error";
}
