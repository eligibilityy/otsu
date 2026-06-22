import { describe, expect, it, vi } from "vitest";
import { clientCredentials } from "../../../src/auth/client-credentials.js";
import { requestClientCredentialsToken } from "../../../src/auth/oauth.js";
import {
  createErrorFromResponse,
  OsuAuthenticationError,
  OsuRateLimitError,
} from "../../../src/errors/index.js";
import { paginateCursor } from "../../../src/pagination/cursor.js";
import { paginatePage } from "../../../src/pagination/page.js";
import { OsuResponseError } from "../../../src/index.js";
import { createTestClient } from "../../helpers/mock.js";

describe("paginateCursor safety", () => {
  it("stops when the same cursor repeats", async () => {
    let calls = 0;
    const results: number[] = [];

    for await (const item of paginateCursor(
      async () => {
        calls++;
        return { items: [calls], cursor: "stuck" };
      },
      { maxPages: 10 },
    )) {
      results.push(item);
    }

    expect(results).toEqual([1, 2]);
    expect(calls).toBe(2);
  });
});

describe("paginatePage", () => {
  it("yields items across pages", async () => {
    const results: number[] = [];

    for await (const item of paginatePage(async (page) => ({
      items: page === 1 ? [1, 2] : [3],
      total: 3,
    }))) {
      results.push(item);
    }

    expect(results).toEqual([1, 2, 3]);
  });

  it("respects maxItems", async () => {
    const results: number[] = [];

    for await (const item of paginatePage(async () => ({ items: [1, 2, 3, 4, 5], total: 100 }), {
      maxItems: 3,
    })) {
      results.push(item);
    }

    expect(results).toEqual([1, 2, 3]);
  });
});

describe("beatmapset search errors", () => {
  it("throws OsuResponseError when error field is set", async () => {
    const client = createTestClient(
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              beatmapsets: [],
              cursor_string: null,
              total: 0,
              recommended_difficulty: null,
              error: "Search query is too short",
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          ),
      ) as typeof fetch,
    );

    await expect(client.beatmapsets.search({ q: "a" })).rejects.toBeInstanceOf(OsuResponseError);
  });
});

describe("createErrorFromResponse", () => {
  it("parses Retry-After header on 429", () => {
    const headers = new Headers({ "Retry-After": "30" });
    const error = createErrorFromResponse(
      429,
      { method: "GET", url: "https://example.com" },
      { error: "rate limited" },
      headers,
    );

    expect(error).toBeInstanceOf(OsuRateLimitError);
    expect((error as OsuRateLimitError).retryAfterMs).toBe(30_000);
  });
});

describe("OAuth validation", () => {
  it("rejects invalid clientId", async () => {
    await expect(
      requestClientCredentialsToken({
        clientId: Number.NaN,
        clientSecret: "secret",
        scopes: ["public"],
      }),
    ).rejects.toBeInstanceOf(OsuAuthenticationError);
  });

  it("rejects empty scopes", async () => {
    await expect(
      requestClientCredentialsToken({
        clientId: 1,
        clientSecret: "secret",
        scopes: [],
      }),
    ).rejects.toBeInstanceOf(OsuAuthenticationError);
  });

  it("deduplicates concurrent token refresh", async () => {
    let refreshCalls = 0;
    const fetch = vi.fn(async () => {
      refreshCalls++;
      await new Promise((r) => setTimeout(r, 20));
      return new Response(
        JSON.stringify({
          token_type: "Bearer",
          expires_in: 3600,
          access_token: "token-abc",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }) as typeof fetch;

    const auth = clientCredentials({
      clientId: 1,
      clientSecret: "secret",
      scopes: ["public"],
      fetch,
    });

    const [a, b] = await Promise.all([auth.getAccessToken(), auth.getAccessToken()]);

    expect(a).toBe("token-abc");
    expect(b).toBe("token-abc");
    expect(refreshCalls).toBe(1);
  });
});

describe("path encoding in requests", () => {
  it("URL-encodes usernames with spaces", async () => {
    const fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      expect(url).toContain("%40user%20name");

      return new Response(JSON.stringify({ id: 1, username: "user name" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as typeof fetch;

    const client = createTestClient(fetch);
    await client.users.get("user name");

    expect(fetch).toHaveBeenCalledOnce();
  });
});
