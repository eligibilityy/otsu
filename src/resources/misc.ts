import type { RequestFn } from "../http/types.js";
import type { SeasonalBackgroundsResult } from "../types/misc.js";

/** Miscellaneous public endpoints. */
export class MiscResource {
  constructor(private readonly request: RequestFn) {}

  /**
   * Get seasonal background images and metadata.
   *
   * @remarks OAuth scope: `public`. API: `GET /seasonal-backgrounds`
   */
  getSeasonalBackgrounds(): Promise<SeasonalBackgroundsResult> {
    return this.request({
      path: "/seasonal-backgrounds",
    });
  }
}
