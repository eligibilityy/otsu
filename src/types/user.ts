import type { Ruleset } from "./enums.js";
import type { ApiTimestamp } from "./primitives.js";
import type { Country, RichText } from "./common.js";

/** Base user object returned across many endpoints. */
export interface User {
  id: number;
  username: string;
  avatar_url: string;
  country_code: string;
  default_group: string | null;
  is_active: boolean;
  is_bot: boolean;
  is_deleted: boolean;
  is_online: boolean;
  is_supporter: boolean;
  last_visit: ApiTimestamp | null;
  pm_friends_only: boolean;
  profile_colour: string | null;
}

/** User profile banner image URLs. */
export interface UserCover {
  custom_url: string | null;
  url: string;
  id: string | number | null;
}

export interface UserKudosu {
  available: number;
  total: number;
}

/** Site user group (e.g. NAT, BN) with display metadata. */
export interface UserGroup {
  id: number;
  identifier: string;
  name: string;
  short_name: string;
  description?: string;
  colour: string | null;
  has_listing?: boolean;
  has_playmodes?: boolean;
  is_probationary?: boolean;
  playmodes?: Ruleset[] | null;
}

/** Profile badge awarded to a user. */
export interface UserBadge {
  awarded_at: ApiTimestamp;
  description: string;
  image_url: string;
  url: string;
}

export interface UserAccountHistory {
  description: string | null;
  id: number;
  length: number;
  permanent: boolean;
  timestamp: ApiTimestamp;
  type: "note" | "restriction" | "silence";
}

/** Per-ruleset play statistics for a user profile or ranking entry. */
export interface UserStatistics {
  count_100?: number;
  count_300?: number;
  count_50?: number;
  count_miss?: number;
  level: { current: number; progress: number };
  pp: number;
  global_rank: number | null;
  country_rank?: number | null;
  hit_accuracy: number;
  accuracy?: number;
  play_count: number;
  play_time: number | null;
  total_hits: number;
  ranked_score: number;
  total_score: number;
  maximum_combo: number;
  replays_watched_by_others: number;
  is_ranked: boolean;
  grade_counts: {
    ss: number;
    ssh: number;
    s: number;
    sh: number;
    a: number;
  };
  user?: User & { country?: Country; cover?: UserCover };
}

/** Full profile returned by GET /users/{user} and GET /me. */
export interface UserExtended extends User {
  cover_url?: string;
  discord: string | null;
  has_supported: boolean;
  interests: string | null;
  join_date: ApiTimestamp;
  kudosu?: UserKudosu;
  location: string | null;
  max_blocks?: number;
  max_friends?: number;
  occupation: string | null;
  playmode: Ruleset;
  playstyle: string[] | null;
  post_count: number;
  profile_hue?: number | null;
  profile_order?: string[];
  title: string | null;
  title_url?: string | null;
  twitter: string | null;
  website: string | null;
  country?: Country;
  cover?: UserCover;
  follower_count?: number;
  statistics?: UserStatistics;
  statistics_rulesets?: Partial<Record<Ruleset, UserStatistics>>;
  groups?: UserGroup[];
  badges?: UserBadge[];
  account_history?: UserAccountHistory[];
  is_restricted?: boolean;
}

/** Single kudosu grant or adjustment in a user's history. */
export interface UserKudosuHistoryEntry {
  id: number;
  action: string;
  amount: number;
  model: string;
  created_at: ApiTimestamp;
  giver?: User;
  post?: { id: number; url: string };
}
