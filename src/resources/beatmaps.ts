import type { RequestFn } from "../http/types.js";
import type { Ruleset } from "../types/enums.js";
import type {
  Beatmap,
  BeatmapDifficultyAttributes,
  BeatmapExtended,
  BeatmapPack,
  BeatmapPacksResult,
  BeatmapUserTag,
} from "../types/beatmap.js";
import type { BeatmapsetExtended } from "../types/beatmapset.js";
import type { BeatmapScoresResult, BeatmapUserScore, Score } from "../types/score.js";
import type { ListOptions } from "../types/common.js";
import { buildPath, formatUserIdentifier } from "../utils/path.js";

/** Options for {@link BeatmapsResource.getScores}. */
export interface GetBeatmapScoresOptions extends ListOptions {
  mode?: Ruleset;
  mods?: string[];
  /** Leaderboard scope. */
  type?: "global" | "country" | "friend" | "team";
  /** When `true`, only returns legacy (stable) scores. */
  legacy_only?: boolean;
}

/** Options for {@link BeatmapsResource.lookup}. */
export interface LookupBeatmapOptions {
  checksum?: string;
  filename?: string;
  id?: number;
}

/** Options for {@link BeatmapsResource.getUserScore}. */
export interface GetBeatmapUserScoreOptions {
  mode?: Ruleset;
  mods?: string[];
  legacy_only?: boolean;
}

/** Options for {@link BeatmapsResource.getUserScores}. */
export interface GetBeatmapUserScoresOptions {
  ruleset?: Ruleset;
  legacy_only?: boolean;
}

/** Options for {@link BeatmapsResource.getDifficultyAttributes}. */
export interface GetDifficultyAttributesOptions {
  /** Mod string array or bitmask integer. */
  mods?: string[] | number;
  ruleset?: Ruleset;
}

/** Beatmap pack listing type for {@link BeatmapsResource.getPacks}. */
export type BeatmapPackType =
  | "standard"
  | "featured"
  | "tournament"
  | "loved"
  | "chart"
  | "theme"
  | "artist";

/** Beatmaps, leaderboards, packs, and difficulty data. */
export class BeatmapsResource {
  constructor(private readonly request: RequestFn) {}

  /**
   * Get a beatmap by id.
   *
   * @param beatmapId - Beatmap id.
   *
   * @remarks OAuth scope: `public`. API: `GET /beatmaps/{beatmap}`
   *
   * @example
   * import { createOsuClient, clientCredentials } from "otsuapi";
   *
   * const client = createOsuClient({
   *   auth: clientCredentials({ clientId, clientSecret, scopes: ["public"] }),
   * });
   * const beatmap = await client.beatmaps.get(1512137);
   */
  get(beatmapId: number): Promise<BeatmapExtended> {
    return this.request<BeatmapExtended>({
      path: buildPath("beatmaps", beatmapId),
    });
  }

  /**
   * Bulk-fetch beatmaps by id.
   *
   * @param ids - Beatmap ids.
   *
   * @remarks OAuth scope: `public`. API: `GET /beatmaps`
   */
  async getMany(ids: number[]): Promise<BeatmapExtended[]> {
    const response = await this.request<{ beatmaps: BeatmapExtended[] }>({
      path: "/beatmaps",
      query: { ids },
    });
    return response.beatmaps;
  }

  /**
   * Look up a beatmap by checksum, filename, or id.
   *
   * @param options - At least one of `checksum`, `filename`, or `id` is required.
   *
   * @remarks OAuth scope: `public`. API: `GET /beatmaps/lookup`
   */
  lookup(options: LookupBeatmapOptions): Promise<BeatmapExtended> {
    return this.request<BeatmapExtended>({
      path: buildPath("beatmaps", "lookup"),
      query: {
        checksum: options.checksum,
        filename: options.filename,
        id: options.id === undefined ? undefined : String(options.id),
      },
    });
  }

  /**
   * Leaderboard scores for a beatmap.
   *
   * @param beatmapId - Beatmap id.
   * @param options - Ruleset, leaderboard type, mods, and pagination.
   *
   * @remarks OAuth scope: `public`. API: `GET /beatmaps/{beatmap}/scores`
   *
   * @example
   * import { createOsuClient, clientCredentials, Ruleset } from "otsuapi";
   *
   * const client = createOsuClient({
   *   auth: clientCredentials({ clientId, clientSecret, scopes: ["public"] }),
   * });
   * const scores = await client.beatmaps.getScores(1512137, {
   *   mode: Ruleset.Osu,
   *   limit: 50,
   * });
   */
  async getScores(beatmapId: number, options: GetBeatmapScoresOptions = {}): Promise<Score[]> {
    const response = await this.request<BeatmapScoresResult>({
      path: buildPath("beatmaps", beatmapId, "scores"),
      query: {
        mode: options.mode,
        type: options.type,
        limit: options.limit,
        offset: options.offset,
        mods: options.mods,
        legacy_only: options.legacy_only,
      },
    });
    return response.scores;
  }

  /**
   * A user's best score on a beatmap.
   *
   * @param beatmapId - Beatmap id.
   * @param user - User id or username.
   * @param options - Ruleset, mods, and legacy filter.
   *
   * @remarks OAuth scope: `public`. API: `GET /beatmaps/{beatmap}/scores/users/{user}`
   */
  getUserScore(
    beatmapId: number,
    user: number | string,
    options: GetBeatmapUserScoreOptions = {},
  ): Promise<BeatmapUserScore> {
    return this.request<BeatmapUserScore>({
      path: buildPath("beatmaps", beatmapId, "scores", "users", formatUserIdentifier(user)),
      query: {
        mode: options.mode,
        mods: options.mods,
        legacy_only: options.legacy_only,
      },
    });
  }

  /**
   * All of a user's scores on a beatmap.
   *
   * @param beatmapId - Beatmap id.
   * @param user - User id or username.
   * @param options - Ruleset and legacy filter.
   *
   * @remarks OAuth scope: `public`. API: `GET /beatmaps/{beatmap}/scores/users/{user}/all`
   */
  async getUserScores(
    beatmapId: number,
    user: number | string,
    options: GetBeatmapUserScoresOptions = {},
  ): Promise<Score[]> {
    const response = await this.request<{ scores: Score[] }>({
      path: buildPath("beatmaps", beatmapId, "scores", "users", formatUserIdentifier(user), "all"),
      query: {
        ruleset: options.ruleset,
        legacy_only: options.legacy_only,
      },
    });
    return response.scores;
  }

  /**
   * Difficulty attributes for a beatmap with optional mods.
   *
   * @param beatmapId - Beatmap id.
   * @param options - Ruleset and mods.
   *
   * @remarks OAuth scope: `public`. API: `POST /beatmaps/{beatmap}/attributes`
   */
  async getDifficultyAttributes(
    beatmapId: number,
    options: GetDifficultyAttributesOptions = {},
  ): Promise<BeatmapDifficultyAttributes> {
    const response = await this.request<{ attributes: BeatmapDifficultyAttributes }>({
      method: "POST",
      path: buildPath("beatmaps", beatmapId, "attributes"),
      body: {
        ruleset_id: options.ruleset,
        mods: options.mods,
      },
    });
    return response.attributes;
  }

  /**
   * Beatmap tags for the authenticated user.
   *
   * @remarks OAuth scope: `identify`. API: `GET /tags`
   */
  async getUserTags(): Promise<BeatmapUserTag[]> {
    const response = await this.request<{ tags: BeatmapUserTag[] }>({
      path: "/tags",
    });
    return response.tags;
  }

  /**
   * List beatmap packs by type.
   *
   * @param type - Pack category. Defaults to `"standard"`.
   * @param cursor_string - Pagination cursor from a previous response.
   *
   * @remarks OAuth scope: `public`. API: `GET /beatmaps/packs`
   */
  getPacks(
    type: BeatmapPackType = "standard",
    cursor_string?: string,
  ): Promise<BeatmapPacksResult> {
    return this.request<BeatmapPacksResult>({
      path: buildPath("beatmaps", "packs"),
      query: { type, cursor_string },
    });
  }

  /**
   * Get a single beatmap pack by tag.
   *
   * @param packTag - Pack tag (e.g. `"PS101"`).
   * @param legacy_only - When `true`, only includes legacy (stable) beatmaps.
   *
   * @remarks OAuth scope: `public`. API: `GET /beatmaps/packs/{pack}`
   */
  getPack(packTag: string, legacy_only = false): Promise<BeatmapPack> {
    return this.request<BeatmapPack>({
      path: buildPath("beatmaps", "packs", packTag),
      query: { legacy_only: Number(legacy_only) },
    });
  }
}
