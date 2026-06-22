import { describe, expect, it, vi } from "vitest";
import { createOsuClient, staticToken } from "../../../src/index.js";
import { paginatePage } from "../../../src/pagination/page.js";

const mockUser = {
  id: 2,
  username: "peppy",
  avatar_url: "https://example.com/a.png",
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
  cover_url: "https://example.com/c.png",
  join_date: "2007-01-01T00:00:00+00:00",
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
};

const mockWikiPage = {
  title: "osu! (game mode)",
  subtitle: "Game Modes",
  path: "Game_Modes/osu!",
  locale: "en",
  layout: "markdown_page",
  markdown: "# osu!",
  tags: ["tap"],
  available_locales: ["en"],
};

describe("HomeResource", () => {
  it("searches with mode=all", async () => {
    const fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      expect(url).toContain("/api/v2/search");
      expect(url).toContain("query=peppy");
      expect(url).toContain("mode=all");

      return new Response(
        JSON.stringify({
          user: { data: [mockUser], total: 1 },
          wiki_page: { data: [mockWikiPage], total: 1 },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }) as typeof fetch;

    const client = createOsuClient({
      auth: staticToken("test-token"),
      fetch,
      rateLimit: { minIntervalMs: 0 },
    });

    const result = await client.home.search({ query: "peppy", mode: "all" });

    expect(result.user?.data[0]!.username).toBe("peppy");
    expect(result.wiki_page?.data[0]!.title).toContain("osu!");
  });

  it("paginates user search results", async () => {
    let page = 0;
    const fetch = vi.fn(async (input: RequestInfo | URL) => {
      page++;
      const url = typeof input === "string" ? input : input.toString();
      expect(url).toContain("mode=user");

      const isPage2 = url.includes("page=2");

      return new Response(
        JSON.stringify({
          user: {
            data: [{ ...mockUser, username: isPage2 ? "peppy2" : "peppy" }],
            total: 2,
          },
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
    for await (const user of client.home.searchUsersAll({ query: "peppy" })) {
      names.push(user.username);
    }

    expect(names).toEqual(["peppy", "peppy2"]);
    expect(page).toBe(2);
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
