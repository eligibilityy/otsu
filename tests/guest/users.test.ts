import { describe, expect, it } from "vitest";
import { Ruleset } from "../../src/index.js";
import { isMultiplayerScore } from "../../src/types/score-guards.js";
import { createGuestClient, hasGuestCredentials } from "../helpers/guest.js";

describe.skipIf(!hasGuestCredentials)("guest / users", () => {
  const client = createGuestClient();

  it("getUser", async () => {
    const user = await client.users.get("@peppy", { mode: Ruleset.Osu });
    expect(user.id).toBeGreaterThan(0);
    expect(user.username).toBeTruthy();
    expect(user.statistics?.global_rank).toBeGreaterThan(0);
  }, 30_000);

  it("getUserScores", async () => {
    const scores = await client.users.getScores(2, {
      type: "best",
      mode: Ruleset.Osu,
      limit: 5,
    });
    expect(scores.length).toBeGreaterThan(0);
    expect(scores.every((score) => !isMultiplayerScore(score))).toBe(true);
    expect(scores[0]!.pp).toBeGreaterThan(0);
  }, 30_000);
});
