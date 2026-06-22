import type { RequestFn } from "../http/types.js";
import type { Score, ScoresListResult } from "../types/score.js";
import type { Ruleset } from "../types/enums.js";
import type { CursorString } from "../types/common.js";
import { buildPath } from "../utils/path.js";

/** Options for {@link ScoresResource.getMany}. */
export interface GetScoresOptions {
  ruleset?: Ruleset;
  /** Pagination cursor from a previous response. */
  cursor_string?: CursorString;
}

/** Individual scores and the global score feed. */
export class ScoresResource {
  constructor(private readonly request: RequestFn) {}

  /**
   * Get a score by id.
   *
   * @param scoreId - Score id.
   *
   * @remarks OAuth scope: `public`. API: `GET /scores/{score}`
   *
   * @example
   * import { createOsuClient, clientCredentials } from "otsuapi";
   *
   * const client = createOsuClient({
   *   auth: clientCredentials({ clientId, clientSecret, scopes: ["public"] }),
   * });
   * const score = await client.scores.get(1234567890);
   */
  get(scoreId: number): Promise<Score> {
    return this.request<Score>({
      path: buildPath("scores", scoreId),
    });
  }

  /**
   * Global score feed.
   *
   * @param options - Ruleset filter and pagination.
   *
   * @remarks OAuth scope: `public`. API: `GET /scores`
   */
  getMany(options: GetScoresOptions = {}): Promise<ScoresListResult> {
    return this.request<ScoresListResult>({
      path: "/scores",
      query: {
        ruleset: options.ruleset,
        cursor_string: options.cursor_string,
      },
    });
  }

  /**
   * Download a score replay file.
   *
   * @param scoreId - Score id.
   *
   * @remarks OAuth scope: `delegate`. API: `GET /scores/{score}/download`
   *
   * @example
   * import { createOsuClient, clientCredentials } from "otsuapi";
   *
   * const client = createOsuClient({
   *   auth: clientCredentials({ clientId, clientSecret, scopes: ["delegate"] }),
   * });
   * const replay = await client.scores.getReplay(1234567890);
   */
  getReplay(scoreId: number): Promise<string> {
    return this.request<string>({
      path: buildPath("scores", scoreId, "download"),
    });
  }
}
