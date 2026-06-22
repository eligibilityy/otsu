import type { Ruleset } from "./enums.js";
import type { ApiTimestamp, ScoreGrade } from "./primitives.js";

/** Minimal user reference embedded in site-wide events. */
export interface EventUser {
  username: string;
  url: string;
  previousUsername?: string;
}

/** Minimal beatmap reference embedded in site-wide events. */
export interface EventBeatmap {
  title: string;
  url: string;
}

/** Minimal beatmapset reference embedded in site-wide events. */
export interface EventBeatmapset {
  title: string;
  url: string;
}

/** Achievement metadata included in achievement events. */
export interface EventAchievement {
  id: number;
  name: string;
  slug: string;
  grouping: string;
  ordering: number;
  description: string;
  mode: Ruleset | null;
  instructions: string | null;
  icon_url: string;
}

/** All documented event `type` values from the osu! API. */
export type EventType =
  | "achievement"
  | "beatmapPlaycount"
  | "beatmapsetApprove"
  | "beatmapsetDelete"
  | "beatmapsetRevive"
  | "beatmapsetUpdate"
  | "beatmapsetUpload"
  | "rank"
  | "rankLost"
  | "userSupportAgain"
  | "userSupportFirst"
  | "userSupportGift"
  | "usernameChange";

interface EventBase {
  id: number;
  created_at: ApiTimestamp;
  type: EventType;
}

/** Event with an undocumented or future `type` value. */
export interface UnknownEvent {
  id: number;
  created_at: ApiTimestamp;
  type: string;
  [key: string]: unknown;
}

/** User unlocked an achievement. */
export interface AchievementEvent extends EventBase {
  type: "achievement";
  achievement: EventAchievement;
  user: EventUser;
}

/** Beatmap reached a play-count milestone. */
export interface BeatmapPlaycountEvent extends EventBase {
  type: "beatmapPlaycount";
  count: number;
  beatmap: EventBeatmap;
}

/** Beatmapset changed status (ranked, qualified, loved, etc.). */
export interface BeatmapsetApproveEvent extends EventBase {
  type: "beatmapsetApprove";
  approval: "ranked" | "approved" | "qualified" | "loved";
  beatmapset: EventBeatmapset;
  user: EventUser;
}

/** Beatmapset was deleted from the site. */
export interface BeatmapsetDeleteEvent extends EventBase {
  type: "beatmapsetDelete";
  beatmapset: EventBeatmapset;
}

/** Graveyarded beatmapset was revived. */
export interface BeatmapsetReviveEvent extends EventBase {
  type: "beatmapsetRevive";
  beatmapset: EventBeatmapset;
  user: EventUser;
}

/** Beatmapset metadata or difficulties were updated. */
export interface BeatmapsetUpdateEvent extends EventBase {
  type: "beatmapsetUpdate";
  beatmapset: EventBeatmapset;
  user: EventUser;
}

/** New beatmapset was uploaded. */
export interface BeatmapsetUploadEvent extends EventBase {
  type: "beatmapsetUpload";
  beatmapset: EventBeatmapset;
  user: EventUser;
}

/** User achieved a top play on a beatmap. */
export interface RankEvent extends EventBase {
  type: "rank";
  scoreRank: ScoreGrade;
  rank: number;
  mode: Ruleset;
  user: EventUser;
  beatmap: EventBeatmap;
}

/** User lost a top play position on a beatmap. */
export interface RankLostEvent extends EventBase {
  type: "rankLost";
  mode: Ruleset;
  user: EventUser;
  beatmap: EventBeatmap;
}

/** User purchased or renewed osu!supporter. */
export interface UserSupportEvent extends EventBase {
  type: "userSupportAgain" | "userSupportFirst" | "userSupportGift";
  user: EventUser;
}

/** User changed their username. */
export interface UsernameChangeEvent extends EventBase {
  type: "usernameChange";
  user: EventUser & { previousUsername: string };
}

/** Events shown on user profiles and the recent-activity feed (excludes playcount milestones). */
export type RecentActivityEvent =
  | AchievementEvent
  | BeatmapsetApproveEvent
  | BeatmapsetDeleteEvent
  | BeatmapsetReviveEvent
  | BeatmapsetUpdateEvent
  | BeatmapsetUploadEvent
  | RankEvent
  | RankLostEvent
  | UserSupportEvent
  | UsernameChangeEvent;

/** Any site-wide event, including playcount milestones and unknown future types. */
export type Event = RecentActivityEvent | BeatmapPlaycountEvent | UnknownEvent;

/** Paginated events from `GET /events`. */
export interface EventsResult {
  events: Event[];
  cursor_string: string | null;
}
