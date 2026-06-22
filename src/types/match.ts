import type { Ruleset } from "./enums.js";
import type { ApiTimestamp } from "./primitives.js";
import type { Beatmap } from "./beatmap.js";
import type { Score } from "./score.js";
import type { User } from "./user.js";

/** Legacy multiplayer/tournament match summary. */
export interface Match {
  id: number;
  start_time: ApiTimestamp;
  end_time: ApiTimestamp | null;
  name: string;
}

/** Event type in a legacy match timeline. */
export type MatchEventType =
  | "host-changed"
  | "match-created"
  | "match-disbanded"
  | "other"
  | "player-joined"
  | "player-kicked"
  | "player-left";

/** Single game (map) played within a legacy match. */
export interface MatchGame {
  id: number;
  beatmap_id: number;
  beatmap: Beatmap;
  start_time: ApiTimestamp;
  end_time: ApiTimestamp | null;
  mode: Ruleset;
  mode_int: number;
  mods: string[];
  scores: Score[];
  scoring_type: "accuracy" | "combo" | "score" | "scorev2";
  team_type: "head-to-head" | "tag-coop" | "tag-team-vs" | "team-vs";
}

/** Timeline entry in a legacy match (join, kick, game start, etc.). */
export interface MatchEvent {
  id: number;
  detail: {
    type: MatchEventType | string;
    text?: string;
  };
  timestamp: ApiTimestamp;
  user_id: number | null;
  game?: MatchGame;
}

/** Full legacy match with events, users, and game state. */
export interface MatchDetail {
  match: Match;
  events: MatchEvent[];
  users: User[];
  first_event_id: number;
  latest_event_id: number;
  current_game_id: number | null;
}

/** Paginated list of legacy matches. */
export interface MatchesListResult {
  matches: Match[];
  cursor?: { match_id: number | null };
  cursor_string?: string | null;
}
