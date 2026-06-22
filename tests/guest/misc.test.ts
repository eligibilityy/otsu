import { describe, expect, it } from "vitest";
import { createGuestClient, hasGuestCredentials } from "../helpers/guest.js";

describe.skipIf(!hasGuestCredentials)("guest / misc", () => {
  const client = createGuestClient();

  it("getSeasonalBackgrounds", async () => {
    const result = await client.misc.getSeasonalBackgrounds();
    expect(result.ends_at).toBeDefined();
    expect(Array.isArray(result.backgrounds)).toBe(true);
  }, 30_000);
});
