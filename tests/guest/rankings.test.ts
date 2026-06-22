import { describe, expect, it } from "vitest";
import { Ruleset } from "../../src/index.js";
import { createGuestClient, hasGuestCredentials } from "../helpers/guest.js";

describe.skipIf(!hasGuestCredentials)("guest / rankings", () => {
  const client = createGuestClient();

  it("getPerformance", async () => {
    const result = await client.rankings.get(Ruleset.Osu, "performance", {
      country: "US",
    });
    if ("ranking" in result) {
      expect(result.ranking.length).toBeGreaterThan(0);
    }
  }, 30_000);
});
