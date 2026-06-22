import { createOsuClient, staticToken } from "../../src/index.js";

/**
 * True when a user access token is available for scoped endpoints (`/me`, chat, forum write, etc.).
 * Set `OSU_ACCESS_TOKEN` after completing the authorization-code flow locally.
 */
export const hasAuthenticatedCredentials = Boolean(process.env.OSU_ACCESS_TOKEN);

export function createAuthenticatedClient() {
  return createOsuClient({
    auth: staticToken(process.env.OSU_ACCESS_TOKEN!),
    rateLimit: { minIntervalMs: 1000 },
    retry: { maxAttempts: 2 },
  });
}
