import type { ApiTimestamp } from "./primitives.js";
import type { CommentableType, CommentSort } from "./primitives.js";
import type { User } from "./user.js";

export type { CommentableType, CommentSort };

/** Single comment on a beatmapset, news post, or changelog build. */
export interface Comment {
  id: number;
  parent_id: number | null;
  user_id: number | null;
  pinned: boolean;
  replies_count: number;
  votes_count: number;
  commentable_type: CommentableType;
  commentable_id: number;
  legacy_name: string | null;
  created_at: ApiTimestamp;
  updated_at: ApiTimestamp;
  deleted_at: ApiTimestamp | null;
  edited_at: ApiTimestamp | null;
  edited_by_id: number | null;
  message?: string;
  message_html?: string;
}

/** Summary of the entity a comment thread is attached to. */
export interface CommentableMeta {
  id?: number;
  title: string;
  type?: CommentableType;
  url?: string;
  owner_id?: number | null;
  owner_title?: string | null;
  locked?: boolean;
  current_user_attributes?: {
    can_new_comment_reason: string | null;
  };
}

/** Full comment thread response with users, votes, and pagination. */
export interface CommentBundle {
  comments: Comment[];
  has_more: boolean;
  has_more_id: number | null;
  included_comments: Comment[];
  pinned_comments: Comment[];
  user_votes: number[];
  user_follow: boolean;
  users: User[];
  sort: CommentSort;
  cursor: { created_at: ApiTimestamp; id: number } | null;
  commentable_meta: CommentableMeta[];
  deleted_commentable_meta?: number;
  total?: number;
  top_level_count?: number;
}
