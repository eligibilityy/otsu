import type { Ruleset } from "./enums.js";
import type { User } from "./user.js";

/** Ranking chart type for `GET /rankings/{mode}/{type}`. */
export type RankingType = "performance" | "score" | "country" | "charts";

/** Audience filter for performance rankings (`all` or `friends`). */
export type RankingFilter = "all" | "friends";

/** Key-count variant for mania performance rankings. */
export type ManiaVariant = "4k" | "7k";

/** Single entry in a performance or score ranking. */
export interface RankingEntry {
  global_rank: number | null;
  country_rank?: number | null;
  pp: number;
  hit_accuracy: number;
  play_count: number;
  ranked_score: number;
  total_score: number;
  total_hits: number;
  maximum_combo: number;
  level: { current: number; progress: number };
  grade_counts: {
    ss: number;
    ssh: number;
    s: number;
    sh: number;
    a: number;
  };
  user: User;
  rank_change_since_30_days?: number;
}

/** Single entry in a country ranking. */
export interface CountryRankingEntry {
  code: string;
  active_users: number;
  play_count: number;
  ranked_score: number;
  performance: number;
  country: { code: string; name: string };
}

/** Paginated performance or score ranking response. */
export interface RankingsResult {
  ranking: RankingEntry[];
  cursor: Record<string, unknown> | null;
  total: number;
}

/** Paginated country ranking response. */
export interface CountryRankingsResult {
  ranking: CountryRankingEntry[];
  cursor: Record<string, unknown> | null;
  total: number;
}

/** Single entry in a kudosu ranking. */
export interface KudosuRankingEntry {
  kudosu: {
    total: number;
    available: number;
  };
  user: User;
}

/** Kudosu ranking list (not cursor-paginated). */
export interface KudosuRankingsResult {
  ranking: KudosuRankingEntry[];
}

/** Options for ranking endpoints (country, filter, spotlight, cursor). */
export interface GetRankingsOptions {
  country?: string;
  filter?: RankingFilter;
  variant?: ManiaVariant;
  spotlight?: number;
  cursor?: Record<string, unknown>;
}
