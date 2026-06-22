import type { RequestFn } from "../http/types.js";
import type { Ruleset } from "../types/enums.js";
import type { UserExtended } from "../types/user.js";
import { buildPath } from "../utils/path.js";

/** Options for {@link MeResource.get}. */
export interface GetMeOptions {
  /** Ruleset for mode-specific statistics (appended to the path). */
  mode?: Ruleset;
}

/** Authenticated user profile and favourites. */
export class MeResource {
  constructor(private readonly request: RequestFn) {}

  /**
   * Get the authenticated user's profile.
   *
   * @param options - Optional ruleset for mode-specific statistics.
   *
   * @remarks OAuth scope: `identify`. API: `GET /me/{mode?}`
   *
   * @example
   * import { createOsuClient, clientCredentials, Ruleset } from "otsuapi";
   *
   * const client = createOsuClient({
   *   auth: clientCredentials({ clientId, clientSecret, scopes: ["identify"] }),
   * });
   * const me = await client.me.get({ mode: Ruleset.Osu });
   */
  get(options: GetMeOptions = {}): Promise<UserExtended> {
    const path = options.mode !== undefined ? buildPath("me", options.mode) : "/me";

    return this.request<UserExtended>({ path });
  }

  /**
   * Favourite beatmapset ids for the authenticated user.
   *
   * @remarks OAuth scope: `identify`. API: `GET /me/beatmapset-favourites`
   */
  async getFavouriteBeatmapsetIds(): Promise<number[]> {
    const response = await this.request<{ beatmapset_ids: number[] }>({
      path: buildPath("me", "beatmapset-favourites"),
    });
    return response.beatmapset_ids;
  }
}
