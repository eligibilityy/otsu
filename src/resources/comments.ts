import type { RequestFn } from "../http/types.js";
import type { CommentBundle } from "../types/comment.js";
import type { CommentableType, CommentSort } from "../types/primitives.js";
import { buildPath } from "../utils/path.js";

export type { CommentableType, CommentSort };

/** Options for {@link CommentsResource.list}. */
export interface GetCommentsOptions {
  commentable_type?: CommentableType;
  commentable_id?: number;
  parent_id?: number;
  sort?: CommentSort;
  after?: number;
  cursor?: { created_at: string | Date; id: number };
}

function removeDeletedItems(bundle: CommentBundle): CommentBundle {
  const commentable_meta = bundle.commentable_meta.filter((item) => item.id != null);
  bundle.deleted_commentable_meta = bundle.commentable_meta.length - commentable_meta.length;
  bundle.commentable_meta = commentable_meta;
  return bundle;
}

/** Comment threads on beatmapsets and other entities. */
export class CommentsResource {
  constructor(private readonly request: RequestFn) {}

  /**
   * Get a single comment by id.
   *
   * @param commentId - Comment id.
   *
   * @remarks OAuth scope: `public`. API: `GET /comments/{comment}`
   */
  async get(commentId: number): Promise<CommentBundle> {
    const bundle = await this.request<CommentBundle>({
      path: buildPath("comments", commentId),
    });
    return removeDeletedItems(bundle);
  }

  /**
   * List comments, optionally filtered by parent entity or parent comment.
   *
   * @param options - Filters, sort order, and cursor pagination.
   *
   * @remarks OAuth scope: `public`. API: `GET /comments`
   *
   * @example
   * import { createOsuClient, clientCredentials } from "otsuapi";
   *
   * const client = createOsuClient({
   *   auth: clientCredentials({ clientId, clientSecret, scopes: ["public"] }),
   * });
   * const bundle = await client.comments.list({
   *   commentable_type: "beatmapset",
   *   commentable_id: 100,
   * });
   */
  async list(options: GetCommentsOptions = {}): Promise<CommentBundle> {
    const bundle = await this.request<CommentBundle>({
      path: "/comments",
      query: {
        commentable_type: options.commentable_type,
        commentable_id: options.commentable_id,
        parent_id: options.parent_id,
        sort: options.sort,
        after: options.after,
        cursor: options.cursor,
      },
    });
    return removeDeletedItems(bundle);
  }
}
