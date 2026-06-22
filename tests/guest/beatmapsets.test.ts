import { describe, expect, it } from "vitest";
import { createGuestClient, hasGuestCredentials } from "../helpers/guest.js";

describe.skipIf(!hasGuestCredentials)("guest / beatmapsets", () => {
  const client = createGuestClient();

  it("search", async () => {
    const result = await client.beatmapsets.search({ q: "freedom dive" });
    expect(result.beatmapsets.length).toBeGreaterThan(0);
    expect(result.beatmapsets[0]!.id).toBeGreaterThan(0);
  }, 30_000);
});
