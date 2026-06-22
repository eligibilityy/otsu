export interface RequestContext {
  method: string;
  url: string;
}

export class OsuApiError extends Error {
  /** HTTP status code. `0` for logical errors in otherwise successful responses. */
  readonly status: number;
  readonly request: RequestContext;
  readonly response?: unknown;

  constructor(message: string, status: number, request: RequestContext, response?: unknown) {
    super(message);
    this.name = "OsuApiError";
    this.status = status;
    this.request = request;
    this.response = response;
  }
}

/** Thrown on HTTP 401 or OAuth token failures. */
export class OsuAuthenticationError extends OsuApiError {
  constructor(message: string, status: number, request: RequestContext, response?: unknown) {
    super(message, status, request, response);
    this.name = "OsuAuthenticationError";
  }
}

/** Thrown on HTTP 403 (missing scope, lazer-only route, etc.). */
export class OsuForbiddenError extends OsuApiError {
  constructor(message: string, status: number, request: RequestContext, response?: unknown) {
    super(message, status, request, response);
    this.name = "OsuForbiddenError";
  }
}

/** Thrown on HTTP 404. */
export class OsuNotFoundError extends OsuApiError {
  constructor(message: string, status: number, request: RequestContext, response?: unknown) {
    super(message, status, request, response);
    this.name = "OsuNotFoundError";
  }
}

/** Thrown on HTTP 422 validation failures. */
export class OsuValidationError extends OsuApiError {
  constructor(message: string, status: number, request: RequestContext, response?: unknown) {
    super(message, status, request, response);
    this.name = "OsuValidationError";
  }
}

/**
 * Thrown on HTTP 429. Check `retryAfterMs` for server-suggested wait time.
 */
export class OsuRateLimitError extends OsuApiError {
  readonly retryAfterMs?: number;

  constructor(
    message: string,
    status: number,
    request: RequestContext,
    response?: unknown,
    retryAfterMs?: number,
  ) {
    super(message, status, request, response);
    this.name = "OsuRateLimitError";
    if (retryAfterMs !== undefined) {
      this.retryAfterMs = retryAfterMs;
    }
  }
}

/**
 * Thrown when the API returns HTTP 200 but includes a logical error payload
 * (e.g. beatmapset search `error` field).
 */
export class OsuResponseError extends OsuApiError {
  constructor(message: string, request: RequestContext, response?: unknown) {
    super(message, 0, request, response);
    this.name = "OsuResponseError";
  }
}

function parseRetryAfterMs(header: string | null): number | undefined {
  if (!header) {
    return undefined;
  }

  const seconds = Number(header);
  if (!Number.isNaN(seconds)) {
    return seconds * 1000;
  }

  const date = Date.parse(header);
  if (!Number.isNaN(date)) {
    return Math.max(0, date - Date.now());
  }

  return undefined;
}

export function createErrorFromResponse(
  status: number,
  request: RequestContext,
  body: unknown,
  headers?: Headers,
): OsuApiError {
  const message =
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof (body as { error: unknown }).error === "string"
      ? (body as { error: string }).error
      : `Request failed with status ${status}`;

  switch (status) {
    case 401:
      return new OsuAuthenticationError(message, status, request, body);
    case 403:
      return new OsuForbiddenError(message, status, request, body);
    case 404:
      return new OsuNotFoundError(message, status, request, body);
    case 422:
      return new OsuValidationError(message, status, request, body);
    case 429:
      return new OsuRateLimitError(
        message,
        status,
        request,
        body,
        parseRetryAfterMs(headers?.get("Retry-After") ?? null),
      );
    default:
      return new OsuApiError(message, status, request, body);
  }
}
