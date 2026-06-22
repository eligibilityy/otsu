import {
  requestClientCredentialsToken,
  type AuthProvider,
  type OAuthClientConfig,
} from "./oauth.js";
import type { OsuScope } from "../types/enums.js";
import { OsuAuthenticationError } from "../errors/index.js";

/** Configuration for the OAuth2 client-credentials flow. */
export interface ClientCredentialsOptions extends OAuthClientConfig {
  /** OAuth scopes to request (e.g. `"public"`). */
  scopes: OsuScope[];
  /** Custom `fetch` implementation (for tests or non-Node runtimes). */
  fetch?: typeof fetch;
}

/**
 * OAuth2 client-credentials flow — for applications that only need public data.
 * Tokens are fetched on first use and refreshed automatically before expiry.
 */
export class ClientCredentialsAuth implements AuthProvider {
  private readonly options: ClientCredentialsOptions;
  private accessToken?: string;
  private expiresAt = 0;
  private refreshPromise?: Promise<void>;

  constructor(options: ClientCredentialsOptions) {
    this.options = options;
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.expiresAt) {
      return this.accessToken;
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

  private async doRefresh(): Promise<void> {
    const fetchImpl = this.options.fetch ?? globalThis.fetch;
    const token = await requestClientCredentialsToken(
      {
        clientId: this.options.clientId,
        clientSecret: this.options.clientSecret,
        scopes: this.options.scopes,
      },
      fetchImpl,
    );

    this.accessToken = token.access_token;
    // Refresh 60s before expiry to avoid mid-request expiration.
    this.expiresAt = Date.now() + Math.max(0, token.expires_in - 60) * 1000;
  }
}

/**
 * Create an auth provider for the OAuth2 client-credentials flow.
 *
 * Use this for server-side apps that only need public data — no user login required.
 * Tokens are fetched on first use and refreshed automatically before expiry.
 *
 * @param options - OAuth app credentials, scopes, and optional custom `fetch`
 * @returns An {@link AuthProvider} that manages access tokens for the configured scopes
 *
 * @remarks OAuth grant type: `client_credentials`. Endpoint: `POST /oauth/token`
 *
 * @example
 * ```ts
 * const client = createOsuClient({
 *   auth: clientCredentials({
 *     clientId: 123,
 *     clientSecret: process.env.OSU_CLIENT_SECRET!,
 *     scopes: ["public"],
 *   }),
 * });
 * ```
 */
export function clientCredentials(options: ClientCredentialsOptions): ClientCredentialsAuth {
  return new ClientCredentialsAuth(options);
}
