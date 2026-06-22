import { describe, expect, it } from "vitest";
import type { AchievementEvent, Event, RankEvent } from "../../../src/types/event.js";
import {
  isAchievementEvent,
  isEventType,
  isKnownEventType,
  isRankEvent,
  isRecentActivityEvent,
} from "../../../src/types/event-guards.js";
import type { MultiplayerScore, Score, SoloScore } from "../../../src/types/score.js";
import { isMultiplayerScore, isSoloScore } from "../../../src/types/score-guards.js";

describe("event type guards", () => {
  const achievement: AchievementEvent = {
    id: 1,
    type: "achievement",
    created_at: "2024-01-01T00:00:00+00:00",
    achievement: {
      id: 1,
      name: "test",
      slug: "test",
      grouping: "misc",
      ordering: 1,
      description: "test",
      mode: null,
      instructions: null,
      icon_url: "https://example.com",
    },
    user: { username: "peppy", url: "https://osu.ppy.sh/users/2" },
  };

  it("narrows with isEventType", () => {
    const event: Event = achievement;
    expect(isEventType(event, "achievement")).toBe(true);
    if (isEventType(event, "achievement")) {
      expect(event.achievement.name).toBe("test");
    }
  });

  it("narrows with isAchievementEvent", () => {
    expect(isAchievementEvent(achievement)).toBe(true);
  });

  it("detects rank events", () => {
    const rank: RankEvent = {
      id: 2,
      type: "rank",
      created_at: "2024-01-01T00:00:00+00:00",
      scoreRank: "S",
      rank: 1,
      mode: "osu",
      user: { username: "peppy", url: "https://osu.ppy.sh/users/2" },
      beatmap: { title: "test", url: "https://example.com" },
    };
    expect(isRankEvent(rank)).toBe(true);
    expect(isRecentActivityEvent(rank)).toBe(true);
  });

  it("flags unknown event types", () => {
    expect(isKnownEventType("achievement")).toBe(true);
    expect(isKnownEventType("futureEvent")).toBe(false);
  });
});

describe("score type guards", () => {
  const solo: SoloScore = {
    id: 1,
    type: "solo_score",
    user_id: 2,
    beatmap_id: 3,
    accuracy: 1,
    mods: [],
    max_combo: 100,
    rank: "X",
    pp: 100,
    passed: true,
    ended_at: "2024-01-01T00:00:00+00:00",
    ruleset_id: 0,
    total_score: 1_000_000,
    ranked: true,
    processed: true,
  };

  const multiplayer: MultiplayerScore = {
    ...solo,
    type: "solo_score",
    room_id: 10,
    playlist_item_id: 20,
  };

  it("narrows solo scores", () => {
    const score: Score = solo;
    expect(isSoloScore(score)).toBe(true);
    expect(isMultiplayerScore(score)).toBe(false);
  });

  it("narrows multiplayer scores", () => {
    expect(isMultiplayerScore(multiplayer)).toBe(true);
    expect(isSoloScore(multiplayer)).toBe(false);
  });

  it("treats scores without type as solo when not multiplayer", () => {
    const untyped = { ...solo, type: undefined } as Score;
    expect(isSoloScore(untyped)).toBe(true);
  });

  it("does not treat null room fields as multiplayer", () => {
    const withNullRoomFields = {
      ...solo,
      room_id: null,
      playlist_item_id: null,
    } as Score;
    expect(isMultiplayerScore(withNullRoomFields)).toBe(false);
    expect(isSoloScore(withNullRoomFields)).toBe(true);
  });
});
