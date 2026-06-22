import type { RequestFn } from "../http/types.js";
import type { SortOrder } from "../types/common.js";
import type { Match, MatchDetail } from "../types/match.js";
import { buildPath } from "../utils/path.js";

export type MatchInfo = Match;

/** Options for {@link MatchesResource.get}. */
export interface GetMatchOptions {
  before?: number;
  after?: number;
  limit?: number;
}

/** Options for {@link MatchesResource.list}. */
export interface GetMatchesOptions {
  limit?: number;
  sort?: SortOrder;
  first_match_id?: number;
}

/** Multiplayer match history (tournament / legacy matches). */
export class MatchesResource {
  constructor(private readonly request: RequestFn) {}

  /**
   * Get a match and its events by id.
   *
   * @param matchId - Match id.
   * @param options - Event window (`before`/`after`) and limit.
   *
   * @remarks OAuth scope: `public`. API: `GET /matches/{match}`
   */
  get(matchId: number, options: GetMatchOptions = {}): Promise<MatchDetail> {
    return this.request<MatchDetail>({
      path: buildPath("matches", matchId),
      query: {
        before: options.before,
        after: options.after,
        limit: options.limit,
      },
    });
  }

  /**
   * List matches with cursor pagination.
   *
   * @param options - Limit, sort order, and starting match id.
   *
   * @remarks OAuth scope: `public`. API: `GET /matches`
   */
  async list(options: GetMatchesOptions = {}): Promise<Match[]> {
    const matchId = options.first_match_id;
    const cursor =
      matchId !== undefined
        ? { match_id: matchId + (options.sort === "id_asc" ? -1 : 1) }
        : undefined;

    const response = await this.request<{ matches: Match[] }>({
      path: "/matches",
      query: {
        cursor,
        limit: options.limit,
        sort: options.sort,
      },
    });
    return response.matches;
  }
}
