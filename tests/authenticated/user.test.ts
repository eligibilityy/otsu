import { describe, expect, it } from "vitest";
import {
  createAuthenticatedClient,
  hasAuthenticatedCredentials,
} from "../helpers/authenticated.js";

describe.skipIf(!hasAuthenticatedCredentials)("authenticated / user", () => {
  const client = createAuthenticatedClient();

  it("getMe", async () => {
    const me = await client.me.get();
    expect(me.id).toBeGreaterThan(0);
    expect(me.username).toBeTruthy();
  }, 30_000);
});
