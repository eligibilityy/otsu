import { describe, expect, it } from "vitest";
import { isKnownEventType } from "../../src/types/event-guards.js";
import { createGuestClient, hasGuestCredentials } from "../helpers/guest.js";

describe.skipIf(!hasGuestCredentials)("guest / events", () => {
  const client = createGuestClient();

  it("get", async () => {
    const result = await client.events.get({ sort: "id_desc" });
    expect(result.events.length).toBeGreaterThan(0);
    for (const event of result.events.slice(0, 5)) {
      expect(typeof event.type).toBe("string");
      if (isKnownEventType(event.type)) {
        expect(event.id).toBeGreaterThan(0);
      }
    }
  }, 30_000);
});
