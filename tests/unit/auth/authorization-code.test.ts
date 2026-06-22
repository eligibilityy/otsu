import { describe, expect, it, vi } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  authorizationCode,
  buildAuthorizeUrl,
  memoryTokenStore,
  fileTokenStore,
  requestAuthorizationCodeToken,
} from "../../../src/auth/index.js";
import { createOsuClient } from "../../../src/index.js";
import { OsuAuthenticationError } from "../../../src/errors/index.js";

const tokenResponse = {
  access_token: "access-abc",
  refresh_token: "refresh-xyz",
  expires_in: 3600,
  token_type: "Bearer",
};

function mockOAuthFetch() {
  return vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
    const body = init?.body?.toString() ?? "";

    if (body.includes("grant_type=authorization_code")) {
      return new Response(JSON.stringify(tokenResponse), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    if (body.includes("grant_type=refresh_token")) {
      return new Response(
        JSON.stringify({
          ...tokenResponse,
          access_token: "access-refreshed",
          refresh_token: "refresh-new",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ error: "invalid_grant" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
}

describe("buildAuthorizeUrl", () => {
  it("builds a valid authorize URL", () => {
    const url = buildAuthorizeUrl(123, {
      redirectUri: "http://localhost:3914/callback",
      scopes: ["public", "identify"],
      state: "test-state",
    });

    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe("https://osu.ppy.sh/oauth/authorize");
    expect(parsed.searchParams.get("client_id")).toBe("123");
    expect(parsed.searchParams.get("response_type")).toBe("code");
    expect(parsed.searchParams.get("scope")).toBe("public identify");
    expect(parsed.searchParams.get("state")).toBe("test-state");
  });
});

describe("AuthorizationCodeAuth", () => {
  it("exchanges a code and returns an access token", async () => {
    const fetch = mockOAuthFetch();
    const auth = authorizationCode({
      clientId: 1,
      clientSecret: "secret",
      redirectUri: "http://localhost/callback",
      scopes: ["public", "identify"],
      store: memoryTokenStore(),
      fetch,
    });

    await auth.exchangeCode("auth-code-123");
    const token = await auth.getAccessToken();

    expect(token).toBe("access-abc");
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("refreshes expired tokens", async () => {
    const fetch = mockOAuthFetch();
    const store = memoryTokenStore();
    await store.set({
      accessToken: "expired",
      refreshToken: "refresh-xyz",
      expiresAt: Date.now() - 1000,
      scopes: ["public", "identify"],
    });

    const auth = authorizationCode({
      clientId: 1,
      clientSecret: "secret",
      redirectUri: "http://localhost/callback",
      scopes: ["public", "identify"],
      store,
      fetch,
    });

    const token = await auth.getAccessToken();
    expect(token).toBe("access-refreshed");
  });

  it("loads tokens from store on startup", async () => {
    const store = memoryTokenStore();
    await store.set({
      accessToken: "stored-access",
      refreshToken: "stored-refresh",
      expiresAt: Date.now() + 3_600_000,
      scopes: ["public"],
    });

    const auth = authorizationCode({
      clientId: 1,
      clientSecret: "secret",
      redirectUri: "http://localhost/callback",
      scopes: ["public"],
      store,
    });

    expect(await auth.getAccessToken()).toBe("stored-access");
  });

  it("throws when no tokens are available", async () => {
    const auth = authorizationCode({
      clientId: 1,
      clientSecret: "secret",
      redirectUri: "http://localhost/callback",
      scopes: ["public"],
      store: memoryTokenStore(),
    });

    await expect(auth.getAccessToken()).rejects.toBeInstanceOf(OsuAuthenticationError);
  });
});

describe("fileTokenStore", () => {
  it("persists tokens to disk", async () => {
    const dir = await mkdtemp(join(tmpdir(), "otsu-auth-"));
    const path = join(dir, "tokens.json");
    const store = fileTokenStore(path);

    await store.set({
      accessToken: "a",
      refreshToken: "r",
      expiresAt: Date.now() + 1000,
      scopes: ["public"],
    });

    const raw = await readFile(path, "utf8");
    expect(JSON.parse(raw).accessToken).toBe("a");

    const loaded = await fileTokenStore(path).get();
    expect(loaded?.refreshToken).toBe("r");

    await rm(dir, { recursive: true });
  });
});

describe("requestAuthorizationCodeToken", () => {
  it("requires refresh_token in response", async () => {
    const fetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ access_token: "a", expires_in: 3600, token_type: "Bearer" }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
    ) as typeof fetch;

    await expect(
      requestAuthorizationCodeToken(
        {
          clientId: 1,
          clientSecret: "s",
          code: "c",
          redirectUri: "http://localhost",
        },
        fetch,
      ),
    ).rejects.toBeInstanceOf(OsuAuthenticationError);
  });
});

describe("client.me with authorization code", () => {
  it("calls GET /me with bearer token", async () => {
    const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString();

      if (url.includes("/oauth/token")) {
        return new Response(JSON.stringify(tokenResponse), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      if (url.includes("/api/v2/me")) {
        expect(init?.headers).toMatchObject({
          Authorization: "Bearer access-abc",
        });
        return new Response(JSON.stringify({ id: 5, username: "tester" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      return new Response("{}", { status: 404 });
    }) as typeof fetch;

    const auth = authorizationCode({
      clientId: 1,
      clientSecret: "secret",
      redirectUri: "http://localhost/callback",
      scopes: ["public", "identify"],
      fetch,
    });

    await auth.exchangeCode("code");
    const client = createOsuClient({ auth, fetch, rateLimit: { minIntervalMs: 0 } });
    const me = await client.me.get();

    expect(me.username).toBe("tester");
  });
});
