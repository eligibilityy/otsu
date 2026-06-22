import type { RequestFn } from "../http/types.js";
import { paginatePage } from "../pagination/page.js";
import type { User } from "../types/user.js";
import type { HomeSearchResponse, SearchMode, SearchOptions, WikiPage } from "../types/search.js";
import { SEARCH_USER_RESULT_LIMIT } from "../types/search.js";

/** Site-wide search for users and wiki pages. */
export class HomeResource {
  constructor(private readonly request: RequestFn) {}

  /**
   * Search users, wiki pages, or both.
   *
   * @param options - Search query, mode (`"user"`, `"wiki_page"`, or `"all"`), and page number.
   *
   * @remarks OAuth scope: `public`. API: `GET /search`
   */
  search(options: SearchOptions): Promise<HomeSearchResponse> {
    return this.request<HomeSearchResponse>({
      path: "/search",
      query: {
        query: options.query,
        mode: options.mode,
        page: options.page,
      },
    });
  }

  /**
   * Search users by query string.
   *
   * @param query - Search term.
   * @param page - Page number. Defaults to `1`.
   *
   * @remarks OAuth scope: `public`. API: `GET /search?mode=user`
   */
  searchUsers(query: string, page = 1): Promise<HomeSearchResponse> {
    return this.search({ query, mode: "user", page });
  }

  /**
   * Search wiki pages by query string.
   *
   * @param query - Search term.
   * @param page - Page number. Defaults to `1`.
   *
   * @remarks OAuth scope: `public`. API: `GET /search?mode=wiki_page`
   */
  searchWiki(query: string, page = 1): Promise<HomeSearchResponse> {
    return this.search({ query, mode: "wiki_page", page });
  }

  /**
   * Paginate user search results. API caps at 100 users total.
   *
   * @param options - Search query (mode and page are managed automatically).
   *
   * @remarks OAuth scope: `public`. API: `GET /search?mode=user`
   *
   * @example
   * for await (const user of client.home.searchUsersAll({ query: "peppy" })) {
   *   console.log(user.username);
   * }
   */
  searchUsersAll(
    options: Omit<SearchOptions, "mode" | "page">,
  ): AsyncGenerator<User, void, undefined> {
    return paginatePage(
      async (page) => {
        const result = await this.search({
          ...options,
          mode: "user",
          page,
        });

        return {
          items: result.user?.data ?? [],
          total: Math.min(result.user?.total ?? 0, SEARCH_USER_RESULT_LIMIT),
        };
      },
      { maxItems: SEARCH_USER_RESULT_LIMIT },
    );
  }

  /**
   * Paginate wiki page search results.
   *
   * @param options - Search query (mode and page are managed automatically).
   *
   * @remarks OAuth scope: `public`. API: `GET /search?mode=wiki_page`
   *
   * @example
   * for await (const page of client.home.searchWikiAll({ query: "ranking" })) {
   *   console.log(page.title);
   * }
   */
  searchWikiAll(
    options: Omit<SearchOptions, "mode" | "page">,
  ): AsyncGenerator<WikiPage, void, undefined> {
    return paginatePage(async (page) => {
      const result = await this.search({
        ...options,
        mode: "wiki_page",
        page,
      });

      return {
        items: result.wiki_page?.data ?? [],
        total: result.wiki_page?.total ?? 0,
      };
    });
  }
}
