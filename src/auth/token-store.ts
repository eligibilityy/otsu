import type { OsuScope } from "../types/enums.js";

/** Persisted OAuth tokens for the authorization-code flow. */
export interface StoredOAuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Unix timestamp (ms) when the access token expires. */
  expiresAt: number;
  scopes: OsuScope[];
}

export interface TokenStore {
  get(): Promise<StoredOAuthTokens | null>;
  set(tokens: StoredOAuthTokens): Promise<void>;
  clear(): Promise<void>;
}

export class MemoryTokenStore implements TokenStore {
  private tokens: StoredOAuthTokens | null = null;

  async get(): Promise<StoredOAuthTokens | null> {
    return this.tokens;
  }

  async set(tokens: StoredOAuthTokens): Promise<void> {
    this.tokens = tokens;
  }

  async clear(): Promise<void> {
    this.tokens = null;
  }
}

/**
 * Create an in-memory token store for the authorization-code flow.
 *
 * @returns A {@link TokenStore} that keeps tokens in process memory
 *
 * @remarks Tokens are lost when the process exits. Use {@link fileTokenStore}
 * for persistence across restarts.
 */
export function memoryTokenStore(): MemoryTokenStore {
  return new MemoryTokenStore();
}
