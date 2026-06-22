import type {
  AchievementEvent,
  BeatmapPlaycountEvent,
  BeatmapsetApproveEvent,
  BeatmapsetDeleteEvent,
  BeatmapsetReviveEvent,
  BeatmapsetUpdateEvent,
  BeatmapsetUploadEvent,
  Event,
  EventType,
  RankEvent,
  RankLostEvent,
  RecentActivityEvent,
  UserSupportEvent,
  UsernameChangeEvent,
} from "./event.js";

/** Narrows an event to a specific `type` literal. */
export function isEventType<T extends EventType>(
  event: Event,
  type: T,
): event is Extract<Event, { type: T }> {
  return event.type === type;
}

export function isAchievementEvent(event: Event): event is AchievementEvent {
  return event.type === "achievement";
}

export function isBeatmapPlaycountEvent(event: Event): event is BeatmapPlaycountEvent {
  return event.type === "beatmapPlaycount";
}

export function isBeatmapsetApproveEvent(event: Event): event is BeatmapsetApproveEvent {
  return event.type === "beatmapsetApprove";
}

export function isBeatmapsetDeleteEvent(event: Event): event is BeatmapsetDeleteEvent {
  return event.type === "beatmapsetDelete";
}

export function isBeatmapsetReviveEvent(event: Event): event is BeatmapsetReviveEvent {
  return event.type === "beatmapsetRevive";
}

export function isBeatmapsetUpdateEvent(event: Event): event is BeatmapsetUpdateEvent {
  return event.type === "beatmapsetUpdate";
}

export function isBeatmapsetUploadEvent(event: Event): event is BeatmapsetUploadEvent {
  return event.type === "beatmapsetUpload";
}

export function isRankEvent(event: Event): event is RankEvent {
  return event.type === "rank";
}

export function isRankLostEvent(event: Event): event is RankLostEvent {
  return event.type === "rankLost";
}

export function isUserSupportEvent(event: Event): event is UserSupportEvent {
  return (
    event.type === "userSupportAgain" ||
    event.type === "userSupportFirst" ||
    event.type === "userSupportGift"
  );
}

export function isUsernameChangeEvent(event: Event): event is UsernameChangeEvent {
  return event.type === "usernameChange";
}

export function isRecentActivityEvent(event: Event): event is RecentActivityEvent {
  return event.type !== "beatmapPlaycount";
}

const KNOWN_EVENT_TYPES = new Set<EventType>([
  "achievement",
  "beatmapPlaycount",
  "beatmapsetApprove",
  "beatmapsetDelete",
  "beatmapsetRevive",
  "beatmapsetUpdate",
  "beatmapsetUpload",
  "rank",
  "rankLost",
  "userSupportAgain",
  "userSupportFirst",
  "userSupportGift",
  "usernameChange",
]);

/** Returns whether the event `type` is one of the known documented variants. */
export function isKnownEventType(type: string): type is EventType {
  return KNOWN_EVENT_TYPES.has(type as EventType);
}
