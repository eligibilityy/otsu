/** Single page of cursor-string-paginated results. */
export interface CursorPage<T> {
  items: T[];
  cursor?: string | null;
}

/** Options for {@link paginateCursor} and {@link paginateJsonCursor}. */
export interface PaginateCursorOptions {
  /** Safety limit — stops after this many pages (default: 100). */
  maxPages?: number;
}

const DEFAULT_MAX_PAGES = 100;

function cursorKey(cursor?: string): string {
  return cursor ?? "";
}

/**
 * Cursor-string pagination — for endpoints that return `cursor_string`.
 * Stops if the same cursor would be requested twice (infinite-loop guard).
 *
 * @example
 * import { createOsuClient, clientCredentials, paginateCursor } from "otsuapi";
 *
 * const client = createOsuClient({ auth: clientCredentials({ clientId, clientSecret, scopes: ["public"] }) });
 * for await (const set of paginateCursor(async (cursor) => {
 *   const r = await client.beatmapsets.search({ q: "test", cursor_string: cursor });
 *   return { items: r.beatmapsets, cursor: r.cursor_string };
 * })) console.log(set.title);
 */
export async function* paginateCursor<T>(
  fetchPage: (cursor?: string) => Promise<CursorPage<T>>,
  options: PaginateCursorOptions = {},
): AsyncGenerator<T, void, undefined> {
  const maxPages = options.maxPages ?? DEFAULT_MAX_PAGES;
  const requested = new Set<string>();
  let cursor: string | undefined;
  let pages = 0;

  for (;;) {
    const key = cursorKey(cursor);
    if (requested.has(key)) {
      return;
    }
    requested.add(key);

    const page = await fetchPage(cursor);
    pages++;

    for (const item of page.items) {
      yield item;
    }

    if (!page.cursor || page.items.length === 0) {
      return;
    }

    if (pages >= maxPages) {
      return;
    }

    cursor = page.cursor;
  }
}

/** Single page of JSON-object-cursor-paginated results (e.g. rankings). */
export interface JsonCursorPage<T> {
  items: T[];
  cursor: Record<string, unknown> | null;
}

function jsonCursorKey(cursor?: Record<string, unknown>): string {
  return cursor ? JSON.stringify(cursor) : "";
}

/**
 * JSON-object cursor pagination — for rankings and similar endpoints.
 */
export async function* paginateJsonCursor<T>(
  fetchPage: (cursor?: Record<string, unknown>) => Promise<JsonCursorPage<T>>,
  options: PaginateCursorOptions = {},
): AsyncGenerator<T, void, undefined> {
  const maxPages = options.maxPages ?? DEFAULT_MAX_PAGES;
  const requested = new Set<string>();
  let cursor: Record<string, unknown> | undefined;
  let pages = 0;

  for (;;) {
    const key = jsonCursorKey(cursor);
    if (requested.has(key)) {
      return;
    }
    requested.add(key);

    const page = await fetchPage(cursor);
    pages++;

    for (const item of page.items) {
      yield item;
    }

    if (!page.cursor || Object.keys(page.cursor).length === 0 || page.items.length === 0) {
      return;
    }

    if (pages >= maxPages) {
      return;
    }

    cursor = page.cursor;
  }
}

/** Serialize a JSON cursor object for use as a query parameter. */
function serializeJsonCursor(cursor?: Record<string, unknown>): string | undefined {
  if (!cursor || Object.keys(cursor).length === 0) {
    return undefined;
  }
  return JSON.stringify(cursor);
}

export { serializeJsonCursor };
