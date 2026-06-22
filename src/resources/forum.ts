import type { RequestFn } from "../http/types.js";
import type { CursorString, SortOrder } from "../types/common.js";
import type {
  CreateForumTopicPollInput,
  CreateForumTopicResult,
  Forum,
  ForumDetailResult,
  ForumPost,
  ForumTopic,
  ForumTopicResult,
  ForumTopicsResult,
} from "../types/forum.js";
import { buildPath } from "../utils/path.js";

/** Forum listing, topics, and posts. */
export class ForumResource {
  constructor(private readonly request: RequestFn) {}

  /**
   * List all forums.
   *
   * @remarks OAuth scope: `public`. API: `GET /forums`
   */
  async list(): Promise<Forum[]> {
    const response = await this.request<{ forums: Forum[] }>({
      path: "/forums",
    });
    return response.forums;
  }

  /**
   * Get a forum by id.
   *
   * @param forumId - Forum id.
   *
   * @remarks OAuth scope: `public`. API: `GET /forums/{forum}`
   */
  get(forumId: number): Promise<ForumDetailResult> {
    return this.request<ForumDetailResult>({
      path: buildPath("forums", forumId),
    });
  }

  /**
   * List forum topics with optional forum filter and cursor pagination.
   *
   * @param options - Forum id, limit, sort order, and cursor string.
   *
   * @remarks OAuth scope: `public`. API: `GET /forums/topics`
   */
  listTopics(
    options: {
      forum_id?: number;
      limit?: number;
      sort?: SortOrder;
      cursor_string?: CursorString;
    } = {},
  ): Promise<ForumTopicsResult> {
    const sort = options.sort === "id_asc" ? "old" : options.sort === "id_desc" ? "new" : undefined;

    return this.request<ForumTopicsResult>({
      path: buildPath("forums", "topics"),
      query: {
        forum_id: options.forum_id,
        limit: options.limit,
        cursor_string: options.cursor_string,
        sort,
      },
    });
  }

  /**
   * Get a forum topic and its posts.
   *
   * @param topicId - Topic id.
   * @param options - Limit, sort order, cursor string, and starting post id.
   *
   * @remarks OAuth scope: `public`. API: `GET /forums/topics/{topic}`
   */
  getTopic(
    topicId: number,
    options: {
      limit?: number;
      sort?: SortOrder;
      cursor_string?: CursorString;
      first_post?: number;
    } = {},
  ): Promise<ForumTopicResult> {
    const start = options.sort !== "id_desc" ? options.first_post : undefined;
    const end = options.sort === "id_desc" ? options.first_post : undefined;

    return this.request<ForumTopicResult>({
      path: buildPath("forums", "topics", topicId),
      query: {
        limit: options.limit,
        sort: options.sort,
        cursor_string: options.cursor_string,
        start,
        end,
      },
    });
  }

  /**
   * Create a new forum topic, optionally with a poll.
   *
   * @param forumId - Target forum id.
   * @param title - Topic title.
   * @param text - First post body.
   * @param poll - Optional poll configuration.
   *
   * @remarks OAuth scope: `forum.write`. API: `POST /forums/topics`
   */
  createTopic(
    forumId: number,
    title: string,
    text: string,
    poll?: CreateForumTopicPollInput,
  ): Promise<CreateForumTopicResult> {
    const with_poll = poll !== undefined;
    const options = poll?.options !== undefined ? poll.options.join("\n") : undefined;

    return this.request<CreateForumTopicResult>({
      method: "POST",
      path: buildPath("forums", "topics"),
      body: {
        forum_id: forumId,
        title,
        body: text,
        with_poll,
        forum_topic_poll: poll
          ? {
              title: poll.title,
              options,
              length_days: poll.length_days,
              max_options: poll.max_options ?? 1,
              vote_change: poll.vote_change ?? false,
              hide_results: poll.hide_results ?? false,
            }
          : undefined,
      },
    });
  }

  /**
   * Reply to a forum topic.
   *
   * @param topicId - Topic id.
   * @param body - Reply body.
   *
   * @remarks OAuth scope: `forum.write`. API: `POST /forums/topics/{topic}/reply`
   */
  reply(topicId: number, body: string): Promise<ForumPost> {
    return this.request<ForumPost>({
      method: "POST",
      path: buildPath("forums", "topics", topicId, "reply"),
      body: { body },
    });
  }

  /**
   * Edit a forum topic title.
   *
   * @param topicId - Topic id.
   * @param title - New topic title.
   *
   * @remarks OAuth scope: `forum.write`. API: `PUT /forums/topics/{topic}`
   */
  editTopicTitle(topicId: number, title: string): Promise<ForumTopic> {
    return this.request<ForumTopic>({
      method: "PUT",
      path: buildPath("forums", "topics", topicId),
      body: { forum_topic: { topic_title: title } },
    });
  }

  /**
   * Edit a forum post body.
   *
   * @param postId - Post id.
   * @param body - New post body.
   *
   * @remarks OAuth scope: `forum.write`. API: `PUT /forums/posts/{post}`
   */
  editPost(postId: number, body: string): Promise<ForumPost> {
    return this.request<ForumPost>({
      method: "PUT",
      path: buildPath("forums", "posts", postId),
      body: { body },
    });
  }

  /**
   * Lock or unlock a forum topic.
   *
   * @param topicId - Topic id.
   * @param lock - When `true`, locks the topic; when `false`, unlocks it.
   *
   * @remarks OAuth scope: `forum.write`. API: `POST /forums/topics/{topic}/lock`
   */
  lockTopic(topicId: number, lock = true): Promise<void> {
    return this.request({
      method: "POST",
      path: buildPath("forums", "topics", topicId, "lock"),
      body: { lock },
    });
  }

  /**
   * Pin, sticky, or unpin a forum topic.
   *
   * @param topicId - Topic id.
   * @param pin - Pin state: `"unpin"`, `"sticky"`, or `"announcement"`.
   *
   * @remarks OAuth scope: `forum.write`. API: `POST /forums/topics/{topic}/pin`
   */
  pinTopic(topicId: number, pin: "unpin" | "sticky" | "announcement"): Promise<void> {
    const pinValue = pin === "sticky" ? 1 : pin === "announcement" ? 2 : 0;
    return this.request({
      method: "POST",
      path: buildPath("forums", "topics", topicId, "pin"),
      body: { pin: pinValue },
    });
  }
}
