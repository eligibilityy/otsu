import { describe, expect, it, vi } from "vitest";
import { createOsuClient, staticToken } from "../../../src/index.js";

const mockRankingEntry = {
  global_rank: 1,
  pp: 15000,
  hit_accuracy: 98.5,
  play_count: 50000,
  ranked_score: 1_000_000_000,
  total_score: 2_000_000_000,
  total_hits: 1_000_000,
  maximum_combo: 3000,
  level: { current: 100, progress: 50 },
  grade_counts: { ss: 10, ssh: 5, s: 20, sh: 15, a: 30 },
  user: {
    id: 1,
    username: "top_player",
    avatar_url: "https://example.com/a.png",
    country_code: "US",
    default_group: "default",
    is_active: true,
    is_bot: false,
    is_deleted: false,
    is_online: false,
    is_supporter: true,
    last_visit: null,
    pm_friends_only: false,
    profile_colour: null,
    cover_url: "https://example.com/c.png",
    join_date: "2010-01-01T00:00:00+00:00",
    playmode: "osu",
    playstyle: [],
    post_count: 0,
    follower_count: 0,
    has_supported: true,
    interests: null,
    location: null,
    occupation: null,
    twitter: null,
    website: null,
    discord: null,
  },
};

describe("RankingsResource", () => {
  it("fetches performance rankings with country filter", async () => {
    const fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      expect(url).toContain("/api/v2/rankings/osu/performance");
      expect(url).toContain("country=US");

      return new Response(
        JSON.stringify({
          ranking: [mockRankingEntry],
          cursor: null,
          total: 1_000_000,
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }) as typeof fetch;

    const client = createOsuClient({
      auth: staticToken("test-token"),
      fetch,
      rateLimit: { minIntervalMs: 0 },
    });

    const result = await client.rankings.get("osu", "performance", {
      country: "US",
    });

    expect(result.ranking[0]!.global_rank).toBe(1);
    expect(result.ranking[0]!.user.username).toBe("top_player");
  });

  it("paginates rankings via getAll", async () => {
    let callCount = 0;
    const fetch = vi.fn(async (input: RequestInfo | URL) => {
      callCount++;
      const url = typeof input === "string" ? input : input.toString();
      const isSecondPage = url.includes("cursor=");

      return new Response(
        JSON.stringify({
          ranking: [
            {
              ...mockRankingEntry,
              global_rank: isSecondPage ? 51 : 1,
              user: { ...mockRankingEntry.user, username: isSecondPage ? "p2" : "p1" },
            },
          ],
          cursor: isSecondPage ? null : { page: 2 },
          total: 100,
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }) as typeof fetch;

    const client = createOsuClient({
      auth: staticToken("test-token"),
      fetch,
      rateLimit: { minIntervalMs: 0 },
    });

    const names: string[] = [];
    for await (const entry of client.rankings.getAll("osu", "performance")) {
      names.push(entry.user.username);
    }

    expect(names).toEqual(["p1", "p2"]);
    expect(callCount).toBe(2);
  });

  it("fetches kudosu rankings", async () => {
    const fetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            ranking: [
              {
                kudosu: { total: 100, available: 50 },
                user: mockRankingEntry.user,
              },
            ],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
    ) as typeof fetch;

    const client = createOsuClient({
      auth: staticToken("test-token"),
      fetch,
      rateLimit: { minIntervalMs: 0 },
    });

    const result = await client.rankings.getKudosu({ page: 1 });

    expect(result.ranking[0]!.kudosu.total).toBe(100);
    expect(fetch.mock.calls[0]![0]).toContain("/rankings/kudosu");
  });
});
