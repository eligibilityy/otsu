import { describe, expect, it } from "vitest";
import { formatUserIdentifier, encodePathSegment } from "../../../src/utils/path.js";

describe("formatUserIdentifier", () => {
  it("keeps numeric ids as-is", () => {
    expect(formatUserIdentifier(2)).toBe("2");
    expect(formatUserIdentifier("12345")).toBe("12345");
  });

  it("prefixes usernames with @", () => {
    expect(formatUserIdentifier("peppy")).toBe("@peppy");
    expect(formatUserIdentifier("@peppy")).toBe("@peppy");
  });
});

describe("encodePathSegment", () => {
  it("encodes special characters in usernames", () => {
    expect(encodePathSegment("@user name")).toBe("%40user%20name");
  });
});
