import type { OsuScope } from "../types/enums.js";
import type { OAuthTokenResponse } from "../types/models.js";
import { OsuAuthenticationError } from "../errors/index.js";

export interface AuthProvider {
  getAccessToken(): Promise<string>;
  refresh?(): Promise<void>;
}

export interface OAuthClientConfig {
  clientId: number;
  clientSecret: string;
}

export const OAUTH_URLS = {
  authorize: "https://osu.ppy.sh/oauth/authorize",
  token: "https://osu.ppy.sh/oauth/token",
  revoke: "https://osu.ppy.sh/oauth/tokens/current",
} as const;

export const TOKEN_REQUEST = { method: "POST", url: OAUTH_URLS.token };

export interface AuthorizeUrlOptions {
  redirectUri: string;
  scopes: OsuScope[];
  state?: string;
}

/**
 * Build the URL to redirect users to for OAuth authorization.
 *
 * @param clientId - osu! OAuth application client ID
 * @param options - Redirect URI, scopes, and optional CSRF `state`
 * @returns Full authorize URL ready for browser redirect
 *
 * @remarks OAuth step 1 of the authorization-code flow. Endpoint: `GET /oauth/authorize`
 */
export function buildAuthorizeUrl(clientId: number, options: AuthorizeUrlOptions): string {
  const url = new URL(OAUTH_URLS.authorize);
  url.searchParams.set("client_id", String(clientId));
  url.searchParams.set("redirect_uri", options.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", options.scopes.join(" "));
  if (options.state !== undefined) {
    url.searchParams.set("state", options.state);
  }
  return url.toString();
}

function parseTokenError(parsed: unknown, status: number): string {
  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "error" in parsed &&
    typeof (parsed as { error: unknown }).error === "string"
  ) {
    return (parsed as { error: string }).error;
  }

  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "message" in parsed &&
    typeof (parsed as { message: unknown }).message === "string"
  ) {
    return (parsed as { message: string }).message;
  }

  return `OAuth token request failed (${status})`;
}

export function validateTokenResponse(parsed: unknown, status: number): OAuthTokenResponse {
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("access_token" in parsed) ||
    typeof (parsed as OAuthTokenResponse).access_token !== "string"
  ) {
    throw new OsuAuthenticationError(
      "OAuth token response missing access_token",
      status,
      TOKEN_REQUEST,
      parsed,
    );
  }

  const token = parsed as OAuthTokenResponse;
  if (typeof token.expires_in !== "number" || token.expires_in <= 0) {
    throw new OsuAuthenticationError(
      "OAuth token response missing expires_in",
      status,
      TOKEN_REQUEST,
      parsed,
    );
  }

  return token;
}

export function expiresAtFromToken(token: OAuthTokenResponse): number {
  return Date.now() + Math.max(0, token.expires_in - 60) * 1000;
}

export async function postTokenRequest(
  body: URLSearchParams,
  fetchImpl: typeof fetch = globalThis.fetch,
): Promise<OAuthTokenResponse> {
  const response = await fetchImpl(OAUTH_URLS.token, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const responseBody = await response.text();
  let parsed: unknown;
  try {
    parsed = responseBody ? JSON.parse(responseBody) : null;
  } catch {
    parsed = responseBody;
  }

  if (!response.ok) {
    throw new OsuAuthenticationError(
      parseTokenError(parsed, response.status),
      response.status,
      TOKEN_REQUEST,
      parsed,
    );
  }

  return validateTokenResponse(parsed, response.status);
}

function validateOAuthConfig(config: OAuthClientConfig & { scopes: OsuScope[] }): void {
  if (!Number.isFinite(config.clientId) || config.clientId <= 0) {
    throw new OsuAuthenticationError(
      "Invalid clientId — must be a positive number",
      0,
      TOKEN_REQUEST,
    );
  }

  if (config.scopes.length === 0) {
    throw new OsuAuthenticationError("At least one OAuth scope is required", 0, TOKEN_REQUEST);
  }
}

/**
 * Request an access token via the client-credentials grant.
 *
 * @param config - OAuth app credentials and scopes
 * @param fetchImpl - Custom `fetch` implementation (defaults to `globalThis.fetch`)
 * @returns Parsed token response including `access_token` and `expires_in`
 *
 * @remarks OAuth grant type: `client_credentials`. Endpoint: `POST /oauth/token`
 */
export async function requestClientCredentialsToken(
  config: OAuthClientConfig & { scopes: OsuScope[] },
  fetchImpl: typeof fetch = globalThis.fetch,
): Promise<OAuthTokenResponse> {
  validateOAuthConfig(config);

  const body = new URLSearchParams({
    client_id: String(config.clientId),
    client_secret: config.clientSecret,
    grant_type: "client_credentials",
    scope: config.scopes.join(" "),
  });

  return postTokenRequest(body, fetchImpl);
}

export interface AuthorizationCodeTokenOptions extends OAuthClientConfig {
  code: string;
  redirectUri: string;
}

export async function requestAuthorizationCodeToken(
  options: AuthorizationCodeTokenOptions,
  fetchImpl: typeof fetch = globalThis.fetch,
): Promise<OAuthTokenResponse> {
  if (!Number.isFinite(options.clientId) || options.clientId <= 0) {
    throw new OsuAuthenticationError("Invalid clientId", 0, TOKEN_REQUEST);
  }

  const body = new URLSearchParams({
    client_id: String(options.clientId),
    client_secret: options.clientSecret,
    grant_type: "authorization_code",
    code: options.code,
    redirect_uri: options.redirectUri,
  });

  const token = await postTokenRequest(body, fetchImpl);
  if (!token.refresh_token) {
    throw new OsuAuthenticationError(
      "Authorization code response missing refresh_token",
      200,
      TOKEN_REQUEST,
      token,
    );
  }

  return token;
}

export interface RefreshTokenOptions extends OAuthClientConfig {
  refreshToken: string;
  scopes?: OsuScope[];
}

export async function requestRefreshToken(
  options: RefreshTokenOptions,
  fetchImpl: typeof fetch = globalThis.fetch,
): Promise<OAuthTokenResponse> {
  if (!Number.isFinite(options.clientId) || options.clientId <= 0) {
    throw new OsuAuthenticationError("Invalid clientId", 0, TOKEN_REQUEST);
  }

  const body = new URLSearchParams({
    client_id: String(options.clientId),
    client_secret: options.clientSecret,
    grant_type: "refresh_token",
    refresh_token: options.refreshToken,
  });

  if (options.scopes && options.scopes.length > 0) {
    body.set("scope", options.scopes.join(" "));
  }

  const token = await postTokenRequest(body, fetchImpl);
  if (!token.refresh_token) {
    throw new OsuAuthenticationError(
      "Refresh response missing refresh_token",
      200,
      TOKEN_REQUEST,
      token,
    );
  }

  return token;
}

/**
 * Revoke the current access token on the osu! server.
 *
 * @param accessToken - Bearer token to invalidate
 * @param fetchImpl - Custom `fetch` implementation (defaults to `globalThis.fetch`)
 * @returns Resolves when revocation succeeds (HTTP 204 or 200)
 *
 * @remarks Endpoint: `DELETE /oauth/tokens/current`. After revocation the token
 * can no longer be used for API requests.
 */
export async function revokeAccessToken(
  accessToken: string,
  fetchImpl: typeof fetch = globalThis.fetch,
): Promise<void> {
  const response = await fetchImpl(OAUTH_URLS.revoke, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok && response.status !== 204) {
    const contentType = response.headers.get("content-type") ?? "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    throw new OsuAuthenticationError(
      parseTokenError(body, response.status),
      response.status,
      { method: "DELETE", url: OAUTH_URLS.revoke },
      body,
    );
  }
}
