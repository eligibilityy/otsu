import type { Ruleset } from "./enums.js";
import type { ApiTimestamp } from "./primitives.js";
import type { User, UserGroup } from "./user.js";

/** Competitive team summary (flag, name, short name). */
export interface Team {
  flag_url: string | null;
  id: number;
  name: string;
  short_name: string;
}

/** Per-ruleset aggregate stats for a team. */
export interface TeamStatistics {
  team_id: number;
  ruleset_id: Ruleset;
  play_count: number;
  ranked_score: number;
  performance: number;
  rank?: number;
}

/** Full team profile with members, leader, and statistics. */
export interface TeamExtended extends Team {
  cover_url: string | null;
  created_at: ApiTimestamp;
  default_ruleset_id: number;
  description: string | null;
  is_open: boolean;
  empty_slots: number;
  members_count?: number;
  leader: User & {
    country?: { code: string; name: string };
    cover?: unknown;
    groups?: UserGroup[];
    team?: Team;
  };
  members: Array<
    User & {
      country?: { code: string; name: string };
      cover?: unknown;
      groups?: UserGroup[];
      team?: Team;
    }
  >;
  statistics: TeamStatistics;
}
