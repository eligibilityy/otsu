import type { ApiTimestamp } from "./primitives.js";
import type { ForumTopicType } from "./primitives.js";
import type { RichText } from "./common.js";

/** Forum section with optional nested subforums. */
export interface Forum {
  id: number;
  name: string;
  description: string;
  subforums?: Forum[];
}

/** Single option in a forum topic poll. */
export interface ForumPollOption {
  id: number;
  text: RichText;
  vote_count?: number;
}

/** Poll attached to a forum topic. */
export interface ForumPoll {
  allow_vote_change: boolean;
  ended_at: ApiTimestamp | null;
  hide_incomplete_results: boolean;
  last_vote_at: ApiTimestamp | null;
  max_votes: number;
  options: ForumPollOption[];
  started_at: ApiTimestamp;
  title: RichText;
  total_vote_count: number;
}

/** Forum topic with metadata and optional poll. */
export interface ForumTopic {
  id: number;
  forum_id: number;
  user_id: number;
  title: string;
  type: ForumTopicType;
  is_locked: boolean;
  post_count: number;
  first_post_id: number;
  last_post_id: number;
  created_at: ApiTimestamp;
  updated_at: ApiTimestamp;
  deleted_at: ApiTimestamp | null;
  views?: number;
  poll: ForumPoll | null;
}

/** Single post in a forum topic. */
export interface ForumPost {
  id: number;
  topic_id: number;
  forum_id: number;
  user_id: number;
  created_at: ApiTimestamp;
  updated_at?: ApiTimestamp;
  deleted_at: ApiTimestamp | null;
  edited_at: ApiTimestamp | null;
  edited_by_id: number | null;
  body: RichText;
}

/** Forum detail with regular and pinned topics. */
export interface ForumDetailResult {
  forum: Forum;
  topics: ForumTopic[];
  pinned_topics: ForumTopic[];
}

/** Paginated forum topic listing. */
export interface ForumTopicsResult {
  topics: ForumTopic[];
  cursor_string: string | null;
}

/** Forum topic with paginated posts. */
export interface ForumTopicResult {
  topic: ForumTopic;
  posts: ForumPost[];
  cursor_string: string | null;
}

/** Newly created forum topic and its opening post. */
export interface CreateForumTopicResult {
  topic: ForumTopic;
  post: ForumPost;
}

/** Poll configuration when creating a forum topic. */
export interface CreateForumTopicPollInput {
  title: string;
  options: string[];
  length_days: number;
  max_options?: number;
  vote_change?: boolean;
  hide_results?: boolean;
}
