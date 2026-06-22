/** ISO 8601 timestamp string returned by the osu! API. */
export type ApiTimestamp = string;

/** Letter grade for a play, from XH (silent SS) through F. */
export type ScoreGrade = "XH" | "X" | "SH" | "S" | "A" | "B" | "C" | "D" | "F";

/** Active game modifier on a score or multiplayer playlist item. */
export interface Mod {
  acronym: string;
  settings?: Record<string, unknown>;
}

/** Chat channel category (public, PM, multiplayer, etc.). */
export type ChannelType =
  | "PUBLIC"
  | "PRIVATE"
  | "MULTIPLAYER"
  | "SPECTATOR"
  | "TEMPORARY"
  | "PM"
  | "GROUP"
  | "ANNOUNCE";

/** Forum topic display type (normal, sticky, or announcement). */
export type ForumTopicType = "normal" | "sticky" | "announcement";

/** Message category in beatmapset discussion threads. */
export type BeatmapsetDiscussionMessageType =
  | "hype"
  | "mapper_note"
  | "praise"
  | "problem"
  | "review"
  | "suggestion";

/** Entity type that comments can be attached to. */
export type CommentableType = "beatmapset" | "build" | "news_post";

/** Sort order for comment listings. */
export type CommentSort = "new" | "old" | "top";
