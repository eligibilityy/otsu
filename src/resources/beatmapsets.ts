import type { RequestFn } from "../http/types.js";
import { paginateCursor } from "../pagination/cursor.js";
import { OsuResponseError } from "../errors/index.js";
import type { Ruleset } from "../types/enums.js";
import type {
  Beatmapset,
  BeatmapsetDiscussionPostsResult,
  BeatmapsetDiscussionsResult,
  BeatmapsetDiscussionVotesResult,
  BeatmapsetEventsResult,
  BeatmapsetExtended,
  BeatmapsetSearchResult,
} from "../types/beatmapset.js";
import type {
  BeatmapsetGeneralFilter,
  BeatmapsetSection,
  BeatmapsetSort,
} from "../types/beatmapset.js";
import type { ListOptions } from "../types/common.js";
import { buildPath } from "../utils/path.js";

/** Options for {@link BeatmapsetsResource.search}. */
export interface SearchBeatmapsetsOptions {
  q?: string;
  sort?: BeatmapsetSort;
  mode?: Ruleset;
  section?: BeatmapsetSection;
  general?: BeatmapsetGeneralFilter[];
  /** Pagination cursor from a previous search response. */
  cursor_string?: string;
  nsfw?: boolean;
}

/** Options for {@link BeatmapsetsResource.getDiscussions}. */
export interface GetBeatmapsetDiscussionsOptions extends ListOptions {
  beatmapset_id?: number;
  beatmap_id?: number;
  user?: number;
  types?: string[];
  filter?: string;
}

/** Options for {@link BeatmapsetsResource.getDiscussionPosts}. */
export interface GetBeatmapsetDiscussionPostsOptions extends ListOptions {
  beatmapset_discussion_id?: number;
  user?: number;
  types?: ("first" | "reply" | "system")[];
}

/** Options for {@link BeatmapsetsResource.getDiscussionVotes}. */
export interface GetBeatmapsetDiscussionVotesOptions extends ListOptions {
  beatmapset_discussion_id?: number;
  user?: number;
  receiver?: number;
  score?: 1 | -1;
}

/** Options for {@link BeatmapsetsResource.getEvents}. */
export interface GetBeatmapsetEventsOptions extends ListOptions {
  beatmapset_id?: number;
  user?: number;
  min_date?: Date;
  max_date?: Date;
  types?: string[];
}

const SEARCH_REQUEST = { method: "GET", url: "https://osu.ppy.sh/api/v2/beatmapsets/search" };

function assertSearchSuccess(result: BeatmapsetSearchResult): void {
  if (result.error == null) {
    return;
  }

  const message =
    typeof result.error === "string"
      ? result.error
      : `Beatmapset search failed: ${JSON.stringify(result.error)}`;

  throw new OsuResponseError(message, SEARCH_REQUEST, result.error);
}

/** Beatmapsets, search, and discussion data. */
export class BeatmapsetsResource {
  constructor(private readonly request: RequestFn) {}

  /**
   * Search beatmapsets.
   *
   * @param options - Query, filters, sort, and pagination.
   *
   * @remarks OAuth scope: `public`. API: `GET /beatmapsets/search`. Throws {@link OsuResponseError} when the API returns HTTP 200 with an `error` field.
   *
   * @example
   * import { createOsuClient, clientCredentials, Ruleset } from "otsuapi";
   *
   * const client = createOsuClient({
   *   auth: clientCredentials({ clientId, clientSecret, scopes: ["public"] }),
   * });
   * const result = await client.beatmapsets.search({ q: "test", mode: Ruleset.Osu });
   */
  async search(options: SearchBeatmapsetsOptions = {}): Promise<BeatmapsetSearchResult> {
    const result = await this.request<BeatmapsetSearchResult>({
      path: "/beatmapsets/search",
      query: {
        q: options.q,
        sort: options.sort,
        m: options.mode,
        s: options.section,
        c: options.general?.join("."),
        cursor_string: options.cursor_string,
        nsfw: options.nsfw === undefined ? undefined : options.nsfw ? "true" : "false",
      },
    });

    assertSearchSuccess(result);
    return result;
  }

  /**
   * Auto-paginate beatmapset search results via `cursor_string`.
   *
   * @param options - Same filters as {@link BeatmapsetsResource.search} (excluding `cursor_string`).
   *
   * @remarks OAuth scope: `public`. API: `GET /beatmapsets/search`
   *
   * @example
   * import { createOsuClient, clientCredentials, Ruleset } from "otsuapi";
   *
   * const client = createOsuClient({
   *   auth: clientCredentials({ clientId, clientSecret, scopes: ["public"] }),
   * });
   * for await (const set of client.beatmapsets.searchAll({ q: "test", mode: Ruleset.Osu })) {
   *   console.log(set.title);
   * }
   */
  searchAll(
    options: Omit<SearchBeatmapsetsOptions, "cursor_string"> = {},
  ): AsyncGenerator<BeatmapsetExtended, void, undefined> {
    return paginateCursor(async (cursor) => {
      const result = await this.search({
        ...options,
        ...(cursor !== undefined ? { cursor_string: cursor } : {}),
      });

      return {
        items: result.beatmapsets,
        cursor: result.cursor_string,
      };
    });
  }

  /**
   * Get a beatmapset by id.
   *
   * @param beatmapsetId - Beatmapset id.
   *
   * @remarks OAuth scope: `public`. API: `GET /beatmapsets/{beatmapset}`
   */
  get(beatmapsetId: number): Promise<BeatmapsetExtended> {
    return this.request<BeatmapsetExtended>({
      path: buildPath("beatmapsets", beatmapsetId),
    });
  }

  /**
   * Look up the beatmapset containing a beatmap.
   *
   * @param beatmapId - Beatmap id.
   *
   * @remarks OAuth scope: `public`. API: `GET /beatmapsets/lookup`
   */
  lookup(beatmapId: number): Promise<BeatmapsetExtended> {
    return this.request<BeatmapsetExtended>({
      path: buildPath("beatmapsets", "lookup"),
      query: { beatmap_id: beatmapId },
    });
  }

  /**
   * List beatmapset discussions.
   *
   * @param options - Filters and pagination.
   *
   * @remarks OAuth scope: `public`. API: `GET /beatmapsets/discussions`
   */
  getDiscussions(
    options: GetBeatmapsetDiscussionsOptions = {},
  ): Promise<BeatmapsetDiscussionsResult> {
    return this.request<BeatmapsetDiscussionsResult>({
      path: buildPath("beatmapsets", "discussions"),
      query: {
        beatmapset_id: options.beatmapset_id,
        beatmap_id: options.beatmap_id,
        user: options.user,
        types: options.types,
        filter: options.filter,
        limit: options.limit,
        sort: options.sort,
        page: options.page,
        cursor_string: options.cursor_string,
      },
    });
  }

  /**
   * List posts in beatmapset discussions.
   *
   * @param options - Filters and pagination.
   *
   * @remarks OAuth scope: `public`. API: `GET /beatmapsets/discussions/posts`
   */
  getDiscussionPosts(
    options: GetBeatmapsetDiscussionPostsOptions = {},
  ): Promise<BeatmapsetDiscussionPostsResult> {
    return this.request<BeatmapsetDiscussionPostsResult>({
      path: buildPath("beatmapsets", "discussions", "posts"),
      query: {
        beatmapset_discussion_id: options.beatmapset_discussion_id,
        user: options.user,
        types: options.types,
        limit: options.limit,
        sort: options.sort,
        page: options.page,
        cursor_string: options.cursor_string,
      },
    });
  }

  /**
   * List votes on beatmapset discussions.
   *
   * @param options - Filters and pagination.
   *
   * @remarks OAuth scope: `public`. API: `GET /beatmapsets/discussions/votes`
   */
  getDiscussionVotes(
    options: GetBeatmapsetDiscussionVotesOptions = {},
  ): Promise<BeatmapsetDiscussionVotesResult> {
    return this.request<BeatmapsetDiscussionVotesResult>({
      path: buildPath("beatmapsets", "discussions", "votes"),
      query: {
        beatmapset_discussion_id: options.beatmapset_discussion_id,
        user: options.user,
        receiver: options.receiver,
        score: options.score,
        limit: options.limit,
        sort: options.sort,
        page: options.page,
        cursor_string: options.cursor_string,
      },
    });
  }

  /**
   * List beatmapset events (nominations, qualifications, etc.).
   *
   * @param options - Filters and pagination.
   *
   * @remarks OAuth scope: `public`. API: `GET /beatmapsets/events`
   */
  getEvents(options: GetBeatmapsetEventsOptions = {}): Promise<BeatmapsetEventsResult> {
    return this.request<BeatmapsetEventsResult>({
      path: buildPath("beatmapsets", "events"),
      query: {
        beatmapset_id: options.beatmapset_id,
        user: options.user,
        min_date: options.min_date,
        max_date: options.max_date,
        types: options.types,
        limit: options.limit,
        sort: options.sort,
        page: options.page,
        cursor_string: options.cursor_string,
      },
    });
  }
}
