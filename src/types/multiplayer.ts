import type { ApiTimestamp } from "./primitives.js";
import type { Mod } from "./primitives.js";
import type { Ruleset } from "./enums.js";
import type { Beatmap, BeatmapExtended } from "./beatmap.js";
import type { Beatmapset } from "./beatmapset.js";
import type { MultiplayerScore } from "./score.js";
import type { User } from "./user.js";

/** Multiplayer room category (normal, spotlight, or daily challenge). */
export type MultiplayerRoomCategory = "normal" | "spotlight" | "daily_challenge";
/** Current state of a multiplayer room. */
export type MultiplayerRoomStatus = "idle" | "playing";
/** Win condition layout for a multiplayer room. */
export type MultiplayerRoomType = "head_to_head" | "team_versus" | "playlists";
/** Who may add maps to a multiplayer room playlist. */
export type MultiplayerQueueMode = "all_players" | "all_players_round_robin" | "host_only";

/** Beatmap entry in a multiplayer room playlist. */
export interface MultiplayerPlaylistItem {
  id: number;
  room_id: number;
  beatmap_id: number;
  ruleset_id: Ruleset;
  allowed_mods: Mod[];
  required_mods: Mod[];
  freestyle: boolean;
  expired: boolean;
  owner_id: number;
  playlist_order: number | null;
  played_at: ApiTimestamp | null;
  beatmap?: Beatmap;
}

/** Real-time or playlist multiplayer room. */
export interface MultiplayerRoom {
  id: number;
  name: string;
  description: string | null;
  category: MultiplayerRoomCategory;
  status: MultiplayerRoomStatus;
  type: MultiplayerRoomType;
  user_id: number;
  starts_at: ApiTimestamp;
  ends_at: ApiTimestamp | null;
  max_attempts: number | null;
  participant_count: number;
  channel_id: number;
  active: boolean;
  has_password: boolean;
  queue_mode: MultiplayerQueueMode;
  auto_skip: boolean;
  pinned: boolean;
  host?: User;
  recent_participants?: User[];
  current_playlist_item?: MultiplayerPlaylistItem | null;
  playlist?: MultiplayerPlaylistItem[];
}

/** User standing in a multiplayer room leaderboard. */
export interface MultiplayerLeaderboardEntry {
  user_id: number;
  room_id: number;
  accuracy: number;
  attempts: number;
  completed: number;
  pp: number;
  total_score: number;
  user: User;
  position?: number;
}

/** Multiplayer room leaderboard with the current user's score. */
export interface MultiplayerLeaderboardResult {
  leaderboard: MultiplayerLeaderboardEntry[];
  user_score: MultiplayerLeaderboardEntry | null;
}

/** Score on a multiplayer playlist item, with optional user embed. */
export interface MultiplayerPlaylistScore extends MultiplayerScore {
  user?: User;
}

/** Paginated scores for a multiplayer playlist item. */
export interface MultiplayerPlaylistScoresResult {
  scores: MultiplayerPlaylistScore[];
  total: number;
  user_score: MultiplayerPlaylistScore | null;
  cursor_string: string | null;
}

/** State change in a multiplayer room (map change, user join, etc.). */
export interface MultiplayerRoomEvent {
  id: number;
  created_at: ApiTimestamp;
  event_type: string;
  playlist_item_id: number | null;
  user_id: number | null;
}

/** Full multiplayer room snapshot with events, playlist, and users. */
export interface MultiplayerRoomEventsResult {
  beatmaps: Beatmap[];
  beatmapsets: Beatmapset[];
  current_playlist_item_id: number;
  events: MultiplayerRoomEvent[];
  first_event_id: number;
  last_event_id: number;
  playlist_items: Array<MultiplayerPlaylistItem & { scores?: MultiplayerPlaylistScore[] }>;
  room: MultiplayerRoom;
  users: User[];
}
