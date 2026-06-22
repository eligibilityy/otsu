/** Single page of page-number-paginated results. */
export interface PageResult<T> {
  items: T[];
  total: number;
}

/** Options for {@link paginatePage}. */
export interface PaginatePageOptions {
  /** Stop after this many pages (default: 100). */
  maxPages?: number;
  /** Stop after yielding this many items. */
  maxItems?: number;
}

const DEFAULT_MAX_PAGES = 100;

/**
 * Page-number pagination — for endpoints like GET /search that use `page=1,2,3…`
 *
 * @example
 * import { createOsuClient, clientCredentials, paginatePage } from "otsuapi";
 *
 * const client = createOsuClient({ auth: clientCredentials({ clientId, clientSecret, scopes: ["public"] }) });
 * for await (const user of paginatePage(async (page) => {
 *   const r = await client.home.search({ query: "peppy", mode: "user", page });
 *   return { items: r.user?.data ?? [], total: r.user?.total ?? 0 };
 * })) console.log(user.username);
 */
export async function* paginatePage<T>(
  fetchPage: (page: number) => Promise<PageResult<T>>,
  options: PaginatePageOptions = {},
): AsyncGenerator<T, void, undefined> {
  const maxPages = options.maxPages ?? DEFAULT_MAX_PAGES;
  let page = 1;
  let yielded = 0;

  for (;;) {
    const result = await fetchPage(page);

    for (const item of result.items) {
      if (yielded >= result.total) {
        return;
      }

      yield item;
      yielded++;

      if (options.maxItems !== undefined && yielded >= options.maxItems) {
        return;
      }
    }

    if (result.items.length === 0 || yielded >= result.total) {
      return;
    }

    if (page >= maxPages) {
      return;
    }

    page++;
  }
}
