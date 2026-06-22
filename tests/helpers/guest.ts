import { createOsuClient, clientCredentials } from "../../src/index.js";

/** True when client-credentials env vars are set (public / guest API tests). */
export const hasGuestCredentials = Boolean(
  process.env.OSU_CLIENT_ID && process.env.OSU_CLIENT_SECRET,
);

export function createGuestClient() {
  return createOsuClient({
    auth: clientCredentials({
      clientId: Number(process.env.OSU_CLIENT_ID),
      clientSecret: process.env.OSU_CLIENT_SECRET!,
      scopes: ["public"],
    }),
    rateLimit: { minIntervalMs: 1000 },
    retry: { maxAttempts: 2 },
  });
}
