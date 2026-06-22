import type { Ruleset } from "./enums.js";
import type { ApiTimestamp, Mod, ScoreGrade } from "./primitives.js";
import type { Beatmap, BeatmapExtended } from "./beatmap.js";
import type { Beatmapset } from "./beatmapset.js";
import type { User } from "./user.js";

/** Hit result counts for a score (keys vary by ruleset). */
export type ScoreStatistics = Record<string, number>;

/** Documented score object `type` values (API header 20220705+). */
export type ScoreObjectType = "solo_score" | (string & {});

/** Fields shared by all modern score objects. */
export interface ScoreBase {
  id: number;
  user_id: number;
  beatmap_id: number;
  accuracy: number;
  mods: Mod[] | string[];
  max_combo: number;
  rank: ScoreGrade | string;
  pp: number | null;
  passed: boolean;
  ended_at: ApiTimestamp;
  ruleset_id: number;
  total_score: number;
  has_replay?: boolean;
  is_perfect_combo?: boolean;
  legacy_perfect?: boolean;
  legacy_score_id?: number | null;
  build_id?: number | null;
  best_id?: number | null;
  started_at?: ApiTimestamp | null;
  statistics?: ScoreStatistics;
  maximum_statistics?: ScoreStatistics;
  beatmap?: Beatmap | BeatmapExtended;
  beatmapset?: Beatmapset;
  user?: User;
  weight?: { percentage: number; pp: number };
  rank_global?: number;
  rank_country?: number;
  position?: number;
  legacy_total_score?: number;
  type?: ScoreObjectType;
  /** @deprecated Legacy field on older API versions (header <= 20220704). */
  score?: number;
  /** @deprecated Legacy field on older API versions. */
  created_at?: ApiTimestamp;
  /** @deprecated Legacy field on older API versions. */
  mode?: Ruleset;
}

/** Solo play score (`type: "solo_score"`). */
export interface SoloScore extends ScoreBase {
  type: "solo_score";
  classic_total_score?: number;
  preserve?: boolean;
  processed?: boolean;
  ranked?: boolean;
}

/** Multiplayer playlist score (includes `room_id` and `playlist_item_id`). */
export interface MultiplayerScore extends ScoreBase {
  room_id: number;
  playlist_item_id: number;
  type: ScoreObjectType;
}

/** Score with an unrecognized shape (forward compatibility). */
export interface GenericScore extends ScoreBase {
  room_id?: number;
  playlist_item_id?: number;
  classic_total_score?: number;
  preserve?: boolean;
  processed?: boolean;
  ranked?: boolean;
}

/** Modern score object (API version header 20220705+). */
export type Score = SoloScore | MultiplayerScore | GenericScore;

/** User's position and score on a beatmap leaderboard. */
export interface BeatmapUserScore {
  position: number;
  score: Score;
}

/** Result of listing scores on a beatmap (`GET /beatmaps/{beatmap}/scores`). */
export interface BeatmapScoresResult {
  scores: Score[];
  user_score?: BeatmapUserScore | null;
}

/** Paginated global score feed (`GET /scores`). */
export interface ScoresListResult {
  scores: Score[];
  cursor_string: string | null;
}
