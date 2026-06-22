import type { MultiplayerScore, Score, SoloScore } from "./score.js";

function getRoomId(score: Score): unknown {
  return (score as MultiplayerScore).room_id;
}

function getPlaylistItemId(score: Score): unknown {
  return (score as MultiplayerScore).playlist_item_id;
}

export function isMultiplayerScore(score: Score): score is MultiplayerScore {
  return typeof getRoomId(score) === "number" && typeof getPlaylistItemId(score) === "number";
}

/** Solo scores are anything that is not a multiplayer playlist score. */
export function isSoloScore(score: Score): score is SoloScore {
  return !isMultiplayerScore(score);
}
