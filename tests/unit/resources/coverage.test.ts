import { describe, expect, it, vi } from "vitest";
import { createOsuClient, staticToken } from "../../../src/index.js";
import { createMockFetch, createTestClient } from "../../helpers/mock.js";

describe("expanded resources", () => {
  it("fetches multiple users", async () => {
    const client = createTestClient(
      createMockFetch({
        "/api/v2/users": { users: [{ id: 1, username: "a" }] },
      }),
    );

    const users = await client.users.getMany([1]);
    expect(users).toHaveLength(1);
    expect(users[0]!.username).toBe("a");
  });

  it("fetches beatmapset by id", async () => {
    const client = createTestClient(
      createMockFetch({
        "/api/v2/beatmapsets/123": { id: 123, title: "test" },
      }),
    );

    const set = await client.beatmapsets.get(123);
    expect(set.id).toBe(123);
  });

  it("fetches wiki page with nested path", async () => {
    const fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      expect(url).toContain("/wiki/en/Game_mode/osu!");
      return new Response(JSON.stringify({ title: "osu!" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as typeof fetch;

    const client = createOsuClient({
      auth: staticToken("token"),
      fetch,
      rateLimit: { minIntervalMs: 0 },
    });

    const page = await client.wiki.get("Game_mode/osu!");
    expect(page.title).toBe("osu!");
  });

  it("lists spotlights", async () => {
    const client = createTestClient(
      createMockFetch({
        "/api/v2/spotlights": { spotlights: [{ id: 1, name: "test" }] },
      }),
    );

    const spotlights = await client.spotlights.list();
    expect(spotlights[0]!.name).toBe("test");
  });

  it("strips deleted commentable meta entries", async () => {
    const client = createTestClient(
      createMockFetch({
        "/api/v2/comments/1": {
          comments: [],
          commentable_meta: [{ id: 1, title: "ok" }, { title: "Deleted Item" }],
          has_more: false,
          has_more_id: null,
          included_comments: [],
          pinned_comments: [],
          user_votes: [],
          user_follow: false,
          users: [],
          sort: "new",
          cursor: null,
        },
      }),
    );

    const bundle = await client.comments.get(1);
    expect(bundle.commentable_meta).toHaveLength(1);
    expect(bundle.deleted_commentable_meta).toBe(1);
  });
});
