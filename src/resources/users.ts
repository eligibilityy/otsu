import type { RequestFn } from "../http/types.js";
import type { Ruleset, ScoreType } from "../types/enums.js";
import type { Beatmap } from "../types/beatmap.js";
import type { Beatmapset } from "../types/beatmapset.js";
import type { RecentActivityEvent } from "../types/event.js";
import type { Score } from "../types/score.js";
import type { User, UserExtended, UserKudosuHistoryEntry } from "../types/user.js";
import type { BeatmapPlaycount } from "../types/beatmap.js";
import type { ListOptions } from "../types/common.js";
import { buildPath, formatUserIdentifier } from "../utils/path.js";

/** Options for {@link UsersResource.get}. */
export interface GetUserOptions {
  /** Ruleset for mode-specific statistics (appended to the path). */
  mode?: Ruleset;
}

/** Options for {@link UsersResource.getScores}. */
export interface GetUserScoresOptions extends ListOptions {
  /** Score list type. Defaults to `"best"`. */
  type?: ScoreType;
  mode?: Ruleset;
  /** When `false`, excludes lazer scores (`legacy_only=1`). */
  lazer?: boolean;
  /** Include failed plays (only for `type: "recent"`). */
  fails?: boolean;
}

/** Beatmapset listing type for {@link UsersResource.getBeatmapsets}. */
export type UserBeatmapsetType =
  | "favourite"
  | "graveyard"
  | "guest"
  | "loved"
  | "nominated"
  | "pending"
  | "ranked";

/** Options for {@link UsersResource.getBeatmapsets}. */
export interface GetUserBeatmapsOptions extends ListOptions {}

/** Options for {@link UsersResource.getPassedBeatmaps}. */
export interface GetPassedBeatmapsOptions {
  beatmapsetIds: number[];
  converts?: boolean;
  is_legacy?: boolean;
  no_diff_reduction?: boolean;
  ruleset?: Ruleset;
}

/** Options for {@link UsersResource.getMany}. */
export interface GetUsersOptions {
  include_variant_statistics?: boolean;
}

/** Options for {@link UsersResource.lookup}. */
export interface LookupUsersOptions {
  ruleset?: Ruleset;
}

/** User profiles, scores, beatmapsets, and social data. */
export class UsersResource {
  constructor(private readonly request: RequestFn) {}

  /**
   * Get a user by id or username.
   *
   * @param user - User id or username (`"peppy"` / `"@peppy"`). Numeric strings are ids.
   * @param options - Optional ruleset for mode-specific statistics.
   *
   * @remarks OAuth scope: `public`. API: `GET /users/{user}`
   *
   * @example
   * import { createOsuClient, clientCredentials, Ruleset } from "otsuapi";
   *
   * const client = createOsuClient({
   *   auth: clientCredentials({ clientId, clientSecret, scopes: ["public"] }),
   * });
   * const user = await client.users.get("@peppy", { mode: Ruleset.Osu });
   */
  get(user: number | string, options: GetUserOptions = {}): Promise<UserExtended> {
    const segments: Array<string | number> = ["users", formatUserIdentifier(user)];
    if (options.mode !== undefined) {
      segments.push(options.mode);
    }

    return this.request<UserExtended>({ path: buildPath(...segments) });
  }

  /**
   * Bulk-fetch users by id.
   *
   * @param ids - Up to 50 user ids per request.
   *
   * @remarks OAuth scope: `public`. API: `GET /users`
   */
  async getMany(ids: number[], options: GetUsersOptions = {}): Promise<User[]> {
    const response = await this.request<{ users: User[] }>({
      path: "/users",
      query: {
        ids,
        include_variant_statistics: options.include_variant_statistics,
      },
    });
    return response.users;
  }

  /**
   * Look up users by id with optional ruleset-specific rank data.
   *
   * @remarks OAuth scope: `public`. API: `GET /users/lookup`
   */
  async lookup(ids: number[], options: LookupUsersOptions = {}): Promise<User[]> {
    const response = await this.request<{ users: User[] }>({
      path: buildPath("users", "lookup"),
      query: {
        ids,
        ruleset_id: options.ruleset,
      },
    });
    return response.users;
  }

  /**
   * List a user's scores (best, firsts, or recent).
   *
   * @param user - User id or username.
   * @param options - Score type, ruleset, pagination, and lazer/fail filters.
   *
   * @remarks OAuth scope: `public`. API: `GET /users/{user}/scores/{type}`
   *
   * @example
   * import { createOsuClient, clientCredentials, Ruleset } from "otsuapi";
   *
   * const client = createOsuClient({
   *   auth: clientCredentials({ clientId, clientSecret, scopes: ["public"] }),
   * });
   * const scores = await client.users.getScores("@peppy", {
   *   type: "best",
   *   mode: Ruleset.Osu,
   *   limit: 10,
   * });
   */
  getScores(user: number | string, options: GetUserScoresOptions = {}): Promise<Score[]> {
    const type = options.type ?? "best";

    return this.request<Score[]>({
      path: buildPath("users", formatUserIdentifier(user), "scores", type),
      query: {
        mode: options.mode,
        limit: options.limit,
        offset: options.offset,
        legacy_only: options.lazer === undefined ? undefined : Number(!options.lazer),
        include_fails: options.fails === undefined ? undefined : String(Number(options.fails)),
      },
    });
  }

  /**
   * List beatmapsets for a user by category.
   *
   * @remarks OAuth scope: `public`. API: `GET /users/{user}/beatmapsets/{type}`
   */
  getBeatmapsets(
    user: number | string,
    type: UserBeatmapsetType,
    options: GetUserBeatmapsOptions = {},
  ): Promise<Beatmapset[]> {
    return this.request<Beatmapset[]>({
      path: buildPath("users", formatUserIdentifier(user), "beatmapsets", type),
      query: {
        limit: options.limit,
        offset: options.offset,
      },
    });
  }

  /**
   * Most-played beatmaps for a user.
   *
   * @remarks OAuth scope: `public`. API: `GET /users/{user}/beatmapsets/most_played`
   */
  getMostPlayed(user: number | string, options: ListOptions = {}): Promise<BeatmapPlaycount[]> {
    return this.request<BeatmapPlaycount[]>({
      path: buildPath("users", formatUserIdentifier(user), "beatmapsets", "most_played"),
      query: {
        limit: options.limit,
        offset: options.offset,
      },
    });
  }

  /**
   * Recent activity events on a user's profile.
   *
   * @remarks OAuth scope: `public`. API: `GET /users/{user}/recent_activity`
   */
  getRecentActivity(
    user: number | string,
    options: ListOptions = {},
  ): Promise<RecentActivityEvent[]> {
    return this.request<RecentActivityEvent[]>({
      path: buildPath("users", formatUserIdentifier(user), "recent_activity"),
      query: {
        limit: options.limit,
        offset: options.offset,
      },
    });
  }

  /**
   * Beatmaps a user has passed from the given beatmapset ids.
   *
   * @remarks OAuth scope: `public`. API: `GET /users/{user}/beatmaps-passed`
   */
  async getPassedBeatmaps(
    user: number | string,
    options: GetPassedBeatmapsOptions,
  ): Promise<Beatmap[]> {
    const response = await this.request<{ beatmaps_passed: Beatmap[] }>({
      path: buildPath("users", formatUserIdentifier(user), "beatmaps-passed"),
      query: {
        beatmapset_ids: options.beatmapsetIds,
        converts: options.converts,
        is_legacy: options.is_legacy,
        no_diff_reduction: options.no_diff_reduction,
        ruleset_id: options.ruleset,
      },
    });
    return response.beatmaps_passed;
  }

  /**
   * Kudosu history for a user.
   *
   * @remarks OAuth scope: `public`. API: `GET /users/{user}/kudosu`
   */
  getKudosuHistory(
    user: number | string,
    options: ListOptions = {},
  ): Promise<UserKudosuHistoryEntry[]> {
    return this.request<UserKudosuHistoryEntry[]>({
      path: buildPath("users", formatUserIdentifier(user), "kudosu"),
      query: {
        limit: options.limit,
        offset: options.offset,
      },
    });
  }

  /**
   * List the authenticated user's friends.
   *
   * @remarks OAuth scope: `friends.read`. API: `GET /friends`
   */
  getFriends(): Promise<User[]> {
    return this.request<User[]>({ path: "/friends" });
  }
}
