import { describe, expect, it, vi } from "vitest";
import { createOsuClient, staticToken } from "../../../src/index.js";
import { paginateCursor } from "../../../src/pagination/cursor.js";
import { createMockFetch } from "../../helpers/mock.js";

const mockBeatmapset = {
  id: 100,
  title: "Freedom Dive",
  title_unicode: "Freedom Dive",
  artist: "xi",
  artist_unicode: "xi",
  creator: "peppy",
  user_id: 2,
  status: "ranked",
  ranked_date: "2012-01-01T00:00:00+00:00",
  submitted_date: "2011-01-01T00:00:00+00:00",
  last_updated: "2012-01-01T00:00:00+00:00",
  bpm: 200,
  play_count: 1000000,
  favourite_count: 5000,
  tags: null,
  language: "instrumental",
  genre: "video game",
  preview_url: "https://example.com/preview.mp3",
  covers: {
    cover: "https://example.com/cover.jpg",
    card: "https://example.com/card.jpg",
    list: "https://example.com/list.jpg",
  },
};

describe("BeatmapsetsResource", () => {
  it("searches beatmapsets with query params", async () => {
    const fetch = createMockFetch({
      "/api/v2/beatmapsets/search": {
        beatmapsets: [mockBeatmapset],
        cursor_string: null,
        total: 1,
        recommended_difficulty: null,
        error: null,
      },
    });

    const client = createOsuClient({
      auth: staticToken("test-token"),
      fetch,
      rateLimit: { minIntervalMs: 0 },
    });

    const result = await client.beatmapsets.search({
      q: "freedom dive",
      sort: "ranked_desc",
    });

    expect(result.beatmapsets).toHaveLength(1);
    expect(result.beatmapsets[0]!.title).toBe("Freedom Dive");

    const url = fetch.mock.calls[0]![0] as string;
    expect(url).toContain("q=freedom");
    expect(url).toContain("sort=ranked_desc");
  });

  it("paginates search results via searchAll", async () => {
    let callCount = 0;
    const fetch = vi.fn(async (input: RequestInfo | URL) => {
      callCount++;
      const url = typeof input === "string" ? input : input.toString();
      const hasCursor = url.includes("cursor_string=page2");

      const body = {
        beatmapsets: [{ ...mockBeatmapset, id: hasCursor ? 102 : 101 }],
        cursor_string: hasCursor ? null : "page2",
        total: 2,
        recommended_difficulty: null,
        error: null,
      };

      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as typeof fetch;

    const client = createOsuClient({
      auth: staticToken("test-token"),
      fetch,
      rateLimit: { minIntervalMs: 0 },
    });

    const results: number[] = [];
    for await (const set of client.beatmapsets.searchAll({ q: "test" })) {
      results.push(set.id);
    }

    expect(results).toEqual([101, 102]);
    expect(callCount).toBe(2);
  });
});

describe("paginateCursor", () => {
  it("yields all items across pages", async () => {
    const pages = [
      { items: [1, 2], cursor: "next" },
      { items: [3], cursor: null },
    ];

    const results: number[] = [];
    for await (const item of paginateCursor(async (cursor) => {
      const index = cursor === "next" ? 1 : 0;
      return pages[index]!;
    })) {
      results.push(item);
    }

    expect(results).toEqual([1, 2, 3]);
  });

  it("stops when a page is empty", async () => {
    const results: number[] = [];
    for await (const item of paginateCursor(async () => ({
      items: [],
      cursor: "still-there",
    }))) {
      results.push(item);
    }

    expect(results).toEqual([]);
  });
});
