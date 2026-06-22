import type { RequestFn } from "../http/types.js";
import type { SortOrder } from "../types/common.js";
import type {
  MultiplayerLeaderboardResult,
  MultiplayerPlaylistScoresResult,
  MultiplayerRoom,
  MultiplayerRoomEventsResult,
} from "../types/multiplayer.js";
import { buildPath } from "../utils/path.js";

export type RoomTypeGroup = "playlists" | "realtime";
export type RoomMode = "active" | "all" | "ended" | "participated" | "owned";
export type RoomSort = "ended" | "created";

/** Multiplayer rooms (playlists and realtime). */
export class MultiplayerResource {
  constructor(private readonly request: RequestFn) {}

  /**
   * List multiplayer rooms by type group and mode.
   *
   * @param type - Room type group (`"playlists"` or `"realtime"`).
   * @param mode - Room listing mode (`"active"`, `"all"`, `"ended"`, `"participated"`, or `"owned"`).
   * @param options - Limit, sort order, and optional season id.
   *
   * @remarks OAuth scope: `public`. API: `GET /rooms`
   */
  list(
    type: RoomTypeGroup,
    mode: RoomMode,
    options: { limit?: number; sort?: RoomSort; season_id?: number } = {},
  ): Promise<MultiplayerRoom[]> {
    return this.request<MultiplayerRoom[]>({
      path: "/rooms",
      query: {
        type_group: type,
        mode,
        limit: options.limit ?? 10,
        sort: options.sort ?? "created",
        season_id: options.season_id,
      },
    });
  }

  /**
   * Get a multiplayer room by id.
   *
   * @param roomId - Room id.
   *
   * @remarks OAuth scope: `public`. API: `GET /rooms/{room}`
   */
  get(roomId: number): Promise<MultiplayerRoom> {
    return this.request<MultiplayerRoom>({
      path: buildPath("rooms", roomId),
    });
  }

  /**
   * Get the leaderboard for a multiplayer room.
   *
   * @param roomId - Room id.
   *
   * @remarks OAuth scope: `public`. API: `GET /rooms/{room}/leaderboard`
   */
  getLeaderboard(roomId: number): Promise<MultiplayerLeaderboardResult> {
    return this.request<MultiplayerLeaderboardResult>({
      path: buildPath("rooms", roomId, "leaderboard"),
    });
  }

  /**
   * Get events for a multiplayer room.
   *
   * @param roomId - Room id.
   *
   * @remarks OAuth scope: `public`. API: `GET /rooms/{room}/events`
   */
  getEvents(roomId: number): Promise<MultiplayerRoomEventsResult> {
    return this.request<MultiplayerRoomEventsResult>({
      path: buildPath("rooms", roomId, "events"),
    });
  }

  /**
   * Get scores for a playlist item within a room.
   *
   * @param roomId - Room id.
   * @param playlistItemId - Playlist item id within the room.
   * @param options - Limit, sort order, and cursor string.
   *
   * @remarks OAuth scope: `public`. API: `GET /rooms/{room}/playlist/{item}/scores`
   */
  getPlaylistItemScores(
    roomId: number,
    playlistItemId: number,
    options: { limit?: number; sort?: SortOrder; cursor_string?: string } = {},
  ): Promise<MultiplayerPlaylistScoresResult> {
    const sort = options.sort === "id_asc" ? "score_asc" : "score_desc";
    return this.request<MultiplayerPlaylistScoresResult>({
      path: buildPath("rooms", roomId, "playlist", playlistItemId, "scores"),
      query: {
        limit: options.limit ?? 50,
        sort,
        cursor_string: options.cursor_string,
      },
    });
  }
}
