import {
  buildAuthorizeUrl,
  expiresAtFromToken,
  requestAuthorizationCodeToken,
  requestRefreshToken,
  type AuthProvider,
  type OAuthClientConfig,
} from "./oauth.js";
import type { StoredOAuthTokens, TokenStore } from "./token-store.js";
import { memoryTokenStore } from "./token-store.js";
import type { OsuScope } from "../types/enums.js";
import type { OAuthTokenResponse } from "../types/models.js";
import { OsuAuthenticationError } from "../errors/index.js";

/** Configuration for the OAuth2 authorization-code flow. */
export interface AuthorizationCodeOptions extends OAuthClientConfig {
  /** Redirect URI registered in your osu! OAuth app. Must match the callback exactly. */
  redirectUri: string;
  /** OAuth scopes to request (e.g. `"public"`, `"identify"`). */
  scopes: OsuScope[];
  /** Token persistence backend. Defaults to an in-memory store. */
  store?: TokenStore;
  /** Custom `fetch` implementation (for tests or non-Node runtimes). */
  fetch?: typeof fetch;
}

/** Options for {@link AuthorizationCodeAuth.getAuthorizeUrl}. */
export interface GetAuthorizeUrlOptions {
  /** CSRF protection value echoed back on the redirect. Use {@link generateOAuthState}. */
  state?: string;
  /** Override the configured redirect URI (must match osu! app settings). */
  redirectUri?: string;
  /** Override the configured scopes for this authorize request. */
  scopes?: OsuScope[];
}

/**
 * OAuth2 authorization-code flow — for user-facing apps.
 * Supports token persistence, refresh, and authorize URL generation.
 */
export class AuthorizationCodeAuth implements AuthProvider {
  private readonly options: AuthorizationCodeOptions;
  private readonly store: TokenStore;
  private accessToken?: string;
  private refreshToken?: string;
  private expiresAt = 0;
  private scopes: OsuScope[];
  private refreshPromise?: Promise<void>;

  constructor(options: AuthorizationCodeOptions) {
    this.options = options;
    this.store = options.store ?? memoryTokenStore();
    this.scopes = [...options.scopes];
  }

  /**
   * Build the URL to redirect the user to for osu! login and consent.
   *
   * @param options - Optional overrides for `state`, `redirectUri`, and `scopes`
   * @returns Full authorize URL (e.g. `https://osu.ppy.sh/oauth/authorize?...`)
   *
   * @remarks OAuth step 1 of the authorization-code flow. Endpoint: `GET /oauth/authorize`
   */
  getAuthorizeUrl(options: GetAuthorizeUrlOptions = {}): string {
    return buildAuthorizeUrl(this.options.clientId, {
      redirectUri: options.redirectUri ?? this.options.redirectUri,
      scopes: options.scopes ?? this.scopes,
      ...(options.state !== undefined ? { state: options.state } : {}),
    });
  }

  /**
   * Exchange an authorization code from the redirect callback for tokens.
   *
   * @param code - Authorization code from the `code` query parameter on redirect
   * @param redirectUri - Redirect URI used in the authorize request (defaults to configured value)
   * @returns Persisted access and refresh tokens with expiry metadata
   *
   * @remarks OAuth step 2 of the authorization-code flow. Endpoint: `POST /oauth/token`
   * with `grant_type=authorization_code`. Tokens are cached in memory and persisted
   * to the configured {@link TokenStore}.
   */
  async exchangeCode(
    code: string,
    redirectUri: string = this.options.redirectUri,
  ): Promise<StoredOAuthTokens> {
    const fetchImpl = this.options.fetch ?? globalThis.fetch;
    const token = await requestAuthorizationCodeToken(
      {
        clientId: this.options.clientId,
        clientSecret: this.options.clientSecret,
        code,
        redirectUri,
      },
      fetchImpl,
    );

    return this.applyToken(token);
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.expiresAt) {
      return this.accessToken;
    }

    if (!this.accessToken) {
      const stored = await this.store.get();
      if (stored) {
        this.loadStored(stored);
        if (this.accessToken && Date.now() < this.expiresAt) {
          return this.accessToken;
        }
      }
    }

    if (!this.refreshToken) {
      throw new OsuAuthenticationError(
        "No OAuth tokens available — visit the authorize URL and call exchangeCode() first",
        0,
        { method: "GET", url: "https://osu.ppy.sh/oauth/authorize" },
      );
    }

    await this.refresh();
    if (!this.accessToken) {
      throw new OsuAuthenticationError("Failed to obtain access token", 0, {
        method: "POST",
        url: "https://osu.ppy.sh/oauth/token",
      });
    }

    return this.accessToken;
  }

  async refresh(): Promise<void> {
    if (this.refreshPromise) {
      await this.refreshPromise;
      return;
    }

    this.refreshPromise = this.doRefresh();
    try {
      await this.refreshPromise;
    } finally {
      delete this.refreshPromise;
    }
  }

  /** Remove cached and persisted tokens. */
  async revokeLocal(): Promise<void> {
    delete this.accessToken;
    delete this.refreshToken;
    this.expiresAt = 0;
    await this.store.clear();
  }

  private async doRefresh(): Promise<void> {
    if (!this.refreshToken) {
      const stored = await this.store.get();
      if (stored?.refreshToken) {
        this.loadStored(stored);
      }
    }

    if (!this.refreshToken) {
      throw new OsuAuthenticationError(
        "No refresh token available — re-authorize via exchangeCode()",
        0,
        { method: "POST", url: "https://osu.ppy.sh/oauth/token" },
      );
    }

    const fetchImpl = this.options.fetch ?? globalThis.fetch;
    const token = await requestRefreshToken(
      {
        clientId: this.options.clientId,
        clientSecret: this.options.clientSecret,
        refreshToken: this.refreshToken,
        scopes: this.scopes,
      },
      fetchImpl,
    );

    await this.applyToken(token);
  }

  private loadStored(stored: StoredOAuthTokens): void {
    this.accessToken = stored.accessToken;
    this.refreshToken = stored.refreshToken;
    this.expiresAt = stored.expiresAt;
    this.scopes = stored.scopes;
  }

  private async applyToken(token: OAuthTokenResponse): Promise<StoredOAuthTokens> {
    this.accessToken = token.access_token;
    if (token.refresh_token) {
      this.refreshToken = token.refresh_token;
    }
    this.expiresAt = expiresAtFromToken(token);

    const stored: StoredOAuthTokens = {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken!,
      expiresAt: this.expiresAt,
      scopes: this.scopes,
    };

    await this.store.set(stored);
    return stored;
  }
}

/**
 * Create an auth provider for the OAuth2 authorization-code flow.
 *
 * Supports token persistence, automatic refresh, and authorize URL generation.
 * Use for user-facing apps that act on behalf of a logged-in osu! user.
 *
 * @param options - OAuth app credentials, redirect URI, scopes, and optional store
 * @returns An {@link AuthorizationCodeAuth} provider
 *
 * @remarks OAuth grant type: `authorization_code`. Requires the user to visit
 * {@link AuthorizationCodeAuth.getAuthorizeUrl} and complete login before calling
 * {@link AuthorizationCodeAuth.exchangeCode}.
 *
 * @example
 * ```ts
 * const auth = authorizationCode({
 *   clientId: 123,
 *   clientSecret: process.env.OSU_CLIENT_SECRET!,
 *   redirectUri: "http://127.0.0.1:3914/callback",
 *   scopes: ["public", "identify"],
 *   store: fileTokenStore(".osu-tokens.json"),
 * });
 *
 * const state = generateOAuthState();
 * const url = auth.getAuthorizeUrl({ state });
 * // Open `url` in a browser, then receive the callback:
 *
 * const server = await createAuthCallbackServer({ port: 3914 });
 * const code = await server.waitForCode();
 * await server.close();
 *
 * await auth.exchangeCode(code);
 * const client = createOsuClient({ auth });
 * const me = await client.me.get();
 * ```
 */
export function authorizationCode(options: AuthorizationCodeOptions): AuthorizationCodeAuth {
  return new AuthorizationCodeAuth(options);
}
