import type { AuthProvider } from "./oauth.js";

/**
 * For when you already have a token — useful in tests or after a manual OAuth flow.
 */
export class StaticTokenAuth implements AuthProvider {
  constructor(private readonly token: string) {}

  async getAccessToken(): Promise<string> {
    return this.token;
  }
}

/**
 * Create an auth provider from a pre-existing access token.
 *
 * @param token - Bearer access token to send on every API request
 * @returns An {@link AuthProvider} that always returns the given token
 *
 * @remarks No OAuth flow or refresh — the token is used as-is until it expires.
 * Useful in tests or after completing a manual authorization-code flow.
 */
export function staticToken(token: string): StaticTokenAuth {
  return new StaticTokenAuth(token);
}
