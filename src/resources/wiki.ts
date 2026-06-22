import type { RequestFn } from "../http/types.js";
import type { WikiPage } from "../types/search.js";

/** Fetch osu! wiki pages by path and locale. */
export class WikiResource {
  constructor(private readonly request: RequestFn) {}

  /**
   * Get a wiki page by path and locale.
   *
   * @param path - Wiki page path (e.g. `"Help_centre"` or `"Gameplay/Game_modifier"`).
   * @param locale - Locale code. Defaults to `"en"`.
   *
   * @remarks OAuth scope: `public`. API: `GET /wiki/{locale}/{path}`
   *
   * @example
   * import { createOsuClient, clientCredentials } from "otsuapi";
   *
   * const client = createOsuClient({
   *   auth: clientCredentials({ clientId, clientSecret, scopes: ["public"] }),
   * });
   * const page = await client.wiki.get("Help_centre");
   */
  get(path: string, locale = "en"): Promise<WikiPage> {
    const encodedPath = path
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");

    return this.request<WikiPage>({
      path: `/wiki/${encodeURIComponent(locale)}/${encodedPath}`,
    });
  }
}
