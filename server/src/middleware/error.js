export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function httpCode(status) {
  if (status === 400) return "bad_request";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 422) return "unprocessable";
  if (status === 429) return "rate_limited";
  return "error";
}

export function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: { code: httpCode(err.status), message: err.message || "Request failed" },
    });
  }
  console.error("[unhandled]", err.stack || err.message);
  return res.status(500).json({
    error: { code: "internal_error", message: "Something went wrong" },
  });
}
