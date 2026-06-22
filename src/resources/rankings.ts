import type { RequestFn } from "../http/types.js";
import { paginateJsonCursor, serializeJsonCursor } from "../pagination/cursor.js";
import type { Ruleset } from "../types/enums.js";
import type {
  CountryRankingsResult,
  GetRankingsOptions,
  KudosuRankingsResult,
  RankingEntry,
  RankingType,
  RankingsResult,
} from "../types/rankings.js";
import { buildPath } from "../utils/path.js";

/** Leaderboards for performance, score, country, charts, and kudosu. */
export class RankingsResource {
  constructor(private readonly request: RequestFn) {}

  /**
   * Fetch a rankings page by ruleset and type.
   *
   * @param mode - Ruleset (`osu`, `taiko`, `fruits`, `mania`).
   * @param type - Ranking type (`performance`, `score`, `country`, or `charts`).
   * @param options - Country, filter, variant, spotlight, and cursor filters.
   *
   * @remarks OAuth scope: `public`. API: `GET /rankings/{mode}/{type}`
   *
   * @example
   * import { createOsuClient, clientCredentials, Ruleset } from "otsuapi";
   *
   * const client = createOsuClient({
   *   auth: clientCredentials({ clientId, clientSecret, scopes: ["public"] }),
   * });
   * const { ranking } = await client.rankings.get(Ruleset.Osu, "performance");
   */
  get(mode: Ruleset, type: "country", options?: GetRankingsOptions): Promise<CountryRankingsResult>;
  get(
    mode: Ruleset,
    type: Exclude<RankingType, "country">,
    options?: GetRankingsOptions,
  ): Promise<RankingsResult>;
  get(
    mode: Ruleset,
    type: RankingType,
    options: GetRankingsOptions = {},
  ): Promise<RankingsResult | CountryRankingsResult> {
    return this.request<RankingsResult | CountryRankingsResult>({
      path: buildPath("rankings", mode, type),
      query: {
        country: options.country,
        filter: options.filter,
        variant: options.variant,
        spotlight: options.spotlight,
        cursor: serializeJsonCursor(options.cursor),
      },
    });
  }

  /**
   * Auto-paginate performance, score, or charts rankings.
   *
   * Yields individual ranking entries across pages.
   *
   * @param mode - Ruleset (`osu`, `taiko`, `fruits`, `mania`).
   * @param type - Ranking type (`performance`, `score`, or `charts`). Country rankings are not supported.
   * @param options - Country, filter, variant, and spotlight filters (cursor is managed automatically).
   *
   * @remarks OAuth scope: `public`. API: `GET /rankings/{mode}/{type}`
   *
   * @example
   * import { createOsuClient, clientCredentials, Ruleset } from "otsuapi";
   *
   * const client = createOsuClient({
   *   auth: clientCredentials({ clientId, clientSecret, scopes: ["public"] }),
   * });
   * for await (const entry of client.rankings.getAll(Ruleset.Osu, "performance")) {
   *   console.log(entry.user.username, entry.global_rank);
   * }
   */
  getAll(
    mode: Ruleset,
    type: Exclude<RankingType, "country">,
    options: Omit<GetRankingsOptions, "cursor"> = {},
  ): AsyncGenerator<RankingEntry, void, undefined> {
    return paginateJsonCursor(async (cursor) => {
      const result = (await this.get(mode, type, {
        ...options,
        ...(cursor !== undefined ? { cursor } : {}),
      })) as RankingsResult;

      return {
        items: result.ranking,
        cursor: result.cursor,
      };
    });
  }

  /**
   * Fetch the kudosu leaderboard.
   *
   * @param options - Optional page number.
   *
   * @remarks OAuth scope: `public`. API: `GET /rankings/kudosu`
   */
  getKudosu(options: { page?: number } = {}): Promise<KudosuRankingsResult> {
    return this.request<KudosuRankingsResult>({
      path: "/rankings/kudosu",
      query: { page: options.page },
    });
  }
}

/** Options for {@link RankingsResource.get} and {@link RankingsResource.getAll}. */
export type { GetRankingsOptions } from "../types/rankings.js";
