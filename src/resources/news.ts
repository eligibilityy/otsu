import type { RequestFn } from "../http/types.js";
import type { NewsPost, NewsPostSummary } from "../types/news.js";
import { buildPath } from "../utils/path.js";

/** osu! news posts and listing. */
export class NewsResource {
  constructor(private readonly request: RequestFn) {}

  /**
   * Get a news post by numeric id or slug.
   *
   * @param post - Post id or slug string. Numeric ids use `key=id`; slugs resolve directly.
   *
   * @remarks OAuth scope: `public`. API: `GET /news/{post}` (with `key=id` when `post` is a number)
   */
  get(post: number | string): Promise<NewsPost> {
    if (typeof post === "number") {
      return this.request<NewsPost>({
        path: buildPath("news", post),
        query: { key: "id" },
      });
    }

    return this.request<NewsPost>({
      path: buildPath("news", post),
    });
  }

  /**
   * List news post summaries, optionally filtered by year.
   *
   * @param year - Filter posts to a calendar year.
   *
   * @remarks OAuth scope: `public`. API: `GET /news`
   */
  async list(year?: number): Promise<NewsPostSummary[]> {
    const response = await this.request<{
      news_sidebar: { news_posts: NewsPostSummary[] };
    }>({
      path: "/news",
      query: { year, limit: 0 },
    });
    return response.news_sidebar.news_posts;
  }
}
