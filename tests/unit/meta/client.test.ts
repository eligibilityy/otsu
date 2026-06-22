import { describe, expect, it, vi } from "vitest";
import { createOsuClient, staticToken } from "../../../src/index.js";
import { OsuNotFoundError } from "../../../src/errors/index.js";
import { RateLimiter } from "../../../src/http/rate-limiter.js";
import { isRetryableError, withRetry } from "../../../src/http/retry.js";
import { createMockFetch } from "../../helpers/mock.js";

const mockUser = {
  id: 2,
  username: "peppy",
  avatar_url: "https://example.com/avatar",
  country_code: "AU",
  default_group: "ppy",
  is_active: true,
  is_bot: false,
  is_deleted: false,
  is_online: false,
  is_supporter: true,
  last_visit: null,
  pm_friends_only: false,
  profile_colour: null,
  cover_url: "https://example.com/cover",
  join_date: "2007-01-01T00:00:00+00:00",
  playmode: "osu",
  playstyle: ["mouse", "keyboard"],
  post_count: 100,
  follower_count: 1000,
  has_supported: true,
  interests: null,
  location: null,
  occupation: null,
  twitter: null,
  website: null,
  discord: null,
};

describe("OsuClient", () => {
  it("fetches a user by id", async () => {
    const fetch = createMockFetch({ "/api/v2/users/2": mockUser });
    const client = createOsuClient({
      auth: staticToken("test-token"),
      fetch,
      rateLimit: { minIntervalMs: 0 },
    });

    const user = await client.users.get(2);

    expect(user.username).toBe("peppy");
    expect(fetch).toHaveBeenCalledOnce();

    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toContain("/api/v2/users/2");
    expect(init?.headers).toMatchObject({
      Authorization: "Bearer test-token",
    });
  });

  it("prefixes usernames with @", async () => {
    const fetch = createMockFetch({ "/api/v2/users/%40peppy": mockUser });
    const client = createOsuClient({
      auth: staticToken("test-token"),
      fetch,
      rateLimit: { minIntervalMs: 0 },
    });

    await client.users.get("peppy");

    expect(fetch.mock.calls[0]![0]).toContain("/users/%40peppy");
  });

  it("throws typed errors for 404 responses", async () => {
    const fetch = vi.fn(
      async () =>
        new Response(JSON.stringify({ error: "not found" }), {
          status: 404,
          headers: { "content-type": "application/json" },
        }),
    ) as typeof fetch;

    const client = createOsuClient({
      auth: staticToken("test-token"),
      fetch,
      rateLimit: { minIntervalMs: 0 },
      retry: { maxAttempts: 1 },
    });

    await expect(client.users.get(999)).rejects.toBeInstanceOf(OsuNotFoundError);
  });
});

describe("RateLimiter", () => {
  it("spaces requests by minIntervalMs", async () => {
    const limiter = new RateLimiter({ minIntervalMs: 50 });
    const start = Date.now();

    await limiter.acquire();
    await limiter.acquire();

    expect(Date.now() - start).toBeGreaterThanOrEqual(45);
  });
});

describe("withRetry", () => {
  it("retries retryable errors", async () => {
    let attempts = 0;

    const result = await withRetry(async () => {
      attempts++;
      if (attempts < 2) {
        throw new TypeError("network");
      }
      return "ok";
    });

    expect(result).toBe("ok");
    expect(attempts).toBe(2);
  });

  it("does not retry non-retryable API errors", async () => {
    let attempts = 0;

    await expect(
      withRetry(async () => {
        attempts++;
        throw new OsuNotFoundError("missing", 404, {
          method: "GET",
          url: "https://example.com",
        });
      }),
    ).rejects.toBeInstanceOf(OsuNotFoundError);

    expect(attempts).toBe(1);
  });
});

describe("isRetryableError", () => {
  it("marks 429 as retryable", () => {
    expect(isRetryableError({ status: 429 })).toBe(true);
  });
});
