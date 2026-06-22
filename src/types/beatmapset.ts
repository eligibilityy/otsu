import type { ApiTimestamp } from "./primitives.js";
import type { BeatmapsetDiscussionMessageType } from "./primitives.js";
import type { Beatmap, BeatmapExtended } from "./beatmap.js";
import type { User, UserGroup } from "./user.js";

/** Sort key for beatmapset search and listing endpoints. */
export type BeatmapsetSort =
  | "title_asc"
  | "title_desc"
  | "artist_asc"
  | "artist_desc"
  | "difficulty_asc"
  | "difficulty_desc"
  | "updated_asc"
  | "updated_desc"
  | "ranked_asc"
  | "ranked_desc"
  | "rating_asc"
  | "rating_desc"
  | "plays_asc"
  | "plays_desc"
  | "favourites_asc"
  | "favourites_desc";

/** Status filter for beatmapset search (`ranked`, `loved`, `mine`, etc.). */
export type BeatmapsetSection =
  | "any"
  | "ranked"
  | "qualified"
  | "loved"
  | "favourites"
  | "pending"
  | "wip"
  | "graveyard"
  | "mine";

/** General search filter flags (recommended, converts, spotlights, etc.). */
export type BeatmapsetGeneralFilter =
  | "recommended"
  | "converts"
  | "follows"
  | "spotlights"
  | "featured_artists";

export interface BeatmapsetCovers {
  cover: string;
  card: string;
  list: string;
  "cover@2x"?: string;
  "card@2x"?: string;
  "list@2x"?: string;
  slimcover?: string;
  "slimcover@2x"?: string;
}

/** Base beatmapset object. */
export interface Beatmapset {
  id: number;
  title: string;
  title_unicode: string;
  artist: string;
  artist_unicode: string;
  creator: string;
  user_id: number;
  status: string;
  bpm: number;
  play_count: number;
  favourite_count: number;
  tags: string | null;
  language: string | null;
  genre: string | null;
  preview_url: string;
  covers: BeatmapsetCovers;
  nsfw?: boolean;
  offset?: number;
  source?: string;
  spotlight?: boolean;
  video?: boolean;
  beatmaps?: Array<Beatmap | BeatmapExtended>;
  has_favourited?: boolean;
}

/** Extended beatmapset with availability, hype, and nomination data. */
export interface BeatmapsetExtended extends Beatmapset {
  availability: {
    download_disabled: boolean;
    more_information: string | null;
  };
  can_be_hyped: boolean;
  deleted_at: ApiTimestamp | null;
  discussion_locked: boolean;
  hype: { current: number; required: number } | null;
  is_scoreable: boolean;
  last_updated: ApiTimestamp;
  legacy_thread_url: string | null;
  nominations_summary: { current: number; required: number };
  ranked: number;
  ranked_date: ApiTimestamp | null;
  rating: number;
  storyboard: boolean;
  submitted_date: ApiTimestamp | null;
}

/** Paginated beatmapset search response from `GET /beatmapsets/search`. */
export interface BeatmapsetSearchResult {
  beatmapsets: BeatmapsetExtended[];
  cursor_string: string | null;
  total: number;
  recommended_difficulty: number | null;
  error: string | null;
}

/** Single discussion thread on a beatmapset (problem, suggestion, review, etc.). */
export interface BeatmapsetDiscussion {
  id: number;
  beatmapset_id: number;
  beatmap_id: number | null;
  user_id: number;
  message_type: BeatmapsetDiscussionMessageType;
  can_be_resolved: boolean;
  can_grant_kudosu: boolean;
  created_at: ApiTimestamp;
  deleted_at: ApiTimestamp | null;
  deleted_by_id: number | null;
  kudosu_denied: boolean;
  last_post_at: ApiTimestamp;
  parent_id: number | null;
  resolved: boolean;
  timestamp: number | null;
  updated_at: ApiTimestamp;
  beatmap?: Beatmap | null;
  beatmapset?: Beatmapset | null;
}

/** Reply post within a beatmapset discussion thread. */
export interface BeatmapsetDiscussionPost {
  id: number;
  beatmapset_discussion_id: number;
  user_id: number;
  message: string;
  system: boolean;
  created_at: ApiTimestamp;
  updated_at: ApiTimestamp;
  deleted_at: ApiTimestamp | null;
  deleted_by_id: number | null;
  last_editor_id: number | null;
}

/** Up/down vote on a beatmapset discussion. */
export interface BeatmapsetDiscussionVote {
  id: number;
  beatmapset_discussion_id: number;
  user_id: number;
  score: number;
  created_at: ApiTimestamp;
  updated_at: ApiTimestamp;
}

/** Paginated beatmapset discussions with related users. */
export interface BeatmapsetDiscussionsResult {
  discussions: BeatmapsetDiscussion[];
  users: User[];
  cursor_string: string | null;
}

/** Paginated discussion posts with beatmapsets and users. */
export interface BeatmapsetDiscussionPostsResult {
  beatmapsets: Beatmapset[];
  posts: BeatmapsetDiscussionPost[];
  users: User[];
  cursor_string: string | null;
}

/** Paginated discussion votes with discussions and users. */
export interface BeatmapsetDiscussionVotesResult {
  votes: BeatmapsetDiscussionVote[];
  discussions: BeatmapsetDiscussion[];
  users: Array<User & { groups?: UserGroup[] }>;
  cursor_string: string | null;
}

/** Beatmapset lifecycle event (nomination, qualification, etc.). */
export interface BeatmapsetEvent {
  id: number;
  type: string;
  created_at: ApiTimestamp;
  [key: string]: unknown;
}

/** Beatmapset events with associated users. */
export interface BeatmapsetEventsResult {
  events: BeatmapsetEvent[];
  users: Array<User & { groups?: UserGroup[] }>;
}
