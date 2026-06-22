/**
 * Backward-compatible re-exports and legacy type aliases.
 * Prefer importing from domain modules (`./user.js`, `./beatmap.js`, etc.).
 */
export type { User, UserExtended, UserStatistics, UserKudosuHistoryEntry } from "./user.js";
export type {
  Beatmap,
  BeatmapExtended,
  BeatmapPlaycount,
  BeatmapPack,
  BeatmapUserTag,
} from "./beatmap.js";
export type { Beatmapset, BeatmapsetExtended, BeatmapsetSearchResult } from "./beatmapset.js";
export type { Score, BeatmapUserScore, BeatmapScoresResult } from "./score.js";

import type { UserExtended } from "./user.js";
import type { BeatmapExtended } from "./beatmap.js";
import type { BeatmapsetExtended } from "./beatmapset.js";
import type { Score } from "./score.js";

/** @deprecated Use `User` or `UserExtended` instead. */
export type UserCompact = UserExtended;

/** @deprecated Use `Beatmap` or `BeatmapExtended` instead. */
export type BeatmapCompact = BeatmapExtended;

/** @deprecated Use `Beatmapset` or `BeatmapsetExtended` instead. */
export type BeatmapsetCompact = BeatmapsetExtended;

/** @deprecated Use `Score` instead. */
export type ScoreCompact = Score;

/** OAuth token response from `POST /oauth/token`. */
export interface OAuthTokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token?: string;
}
