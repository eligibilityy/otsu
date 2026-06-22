import type { User } from "./user.js";

/** Search target for `GET /search` (`all`, `user`, or `wiki_page`). */
export type SearchMode = "all" | "user" | "wiki_page";

/** Generic search result page with total hit count. */
export interface SearchResult<T> {
  data: T[];
  total: number;
}

/** osu! wiki page returned by search. */
export interface WikiPage {
  title: string;
  subtitle: string | null;
  path: string;
  locale: string;
  layout: string;
  markdown: string;
  tags: string[];
  available_locales: string[];
}

/** Combined home search response with optional user and wiki results. */
export interface HomeSearchResponse {
  user?: SearchResult<User>;
  wiki_page?: SearchResult<WikiPage>;
}

/** Options for `GET /search`. */
export interface SearchOptions {
  query: string;
  mode?: SearchMode;
  page?: number;
}

/** osu! only exposes the first 100 user search results via the API. */
export const SEARCH_USER_RESULT_LIMIT = 100;
