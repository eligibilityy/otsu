import { vi } from "vitest";
import { createOsuClient, staticToken } from "../../src/index.js";

export function createMockFetch(handlers: Record<string, unknown>) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();

    for (const [pattern, body] of Object.entries(handlers)) {
      if (url.includes(pattern)) {
        return new Response(JSON.stringify(body), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
}

export function createTestClient(fetch: typeof globalThis.fetch) {
  return createOsuClient({
    auth: staticToken("test-token"),
    fetch,
    rateLimit: { minIntervalMs: 0 },
    retry: { maxAttempts: 1 },
  });
}
