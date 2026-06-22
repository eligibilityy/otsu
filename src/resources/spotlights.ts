import type { RequestFn } from "../http/types.js";
import type { Ruleset } from "../types/enums.js";
import type { Spotlight, SpotlightRankingResult } from "../types/spotlight.js";
import { buildPath } from "../utils/path.js";

/** Seasonal spotlights and spotlight rankings. */
export class SpotlightsResource {
  constructor(private readonly request: RequestFn) {}

  /**
   * List all spotlights.
   *
   * @remarks OAuth scope: `public`. API: `GET /spotlights`
   */
  async list(): Promise<Spotlight[]> {
    const response = await this.request<{ spotlights: Spotlight[] }>({
      path: "/spotlights",
    });
    return response.spotlights;
  }

  /**
   * Get spotlight rankings for a ruleset.
   *
   * @param mode - Ruleset to rank.
   * @param spotlightId - Spotlight id.
   * @param filter - Ranking filter (`"all"` or `"friends"`).
   *
   * @remarks OAuth scope: `public`. API: `GET /rankings/{mode}/charts`
   */
  getRanking(
    mode: Ruleset,
    spotlightId: number,
    filter: "all" | "friends" = "all",
  ): Promise<SpotlightRankingResult> {
    return this.request<SpotlightRankingResult>({
      path: buildPath("rankings", mode, "charts"),
      query: { spotlight: spotlightId, filter },
    });
  }
}
