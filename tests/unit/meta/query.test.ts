import { describe, expect, it } from "vitest";
import { serializeQuery } from "../../../src/utils/query.js";

describe("serializeQuery", () => {
  it("serializes nested cursor objects", () => {
    const params = serializeQuery({ cursor: { match_id: 11 } });
    expect(params.get("cursor[match_id]")).toBe("11");
  });

  it("serializes array values with [] suffix", () => {
    const params = serializeQuery({ ids: [1, 2, 3] });
    expect(params.getAll("ids[]")).toEqual(["1", "2", "3"]);
  });

  it("omits undefined and empty strings", () => {
    const params = serializeQuery({ a: undefined, b: "", c: "ok" });
    expect(params.has("a")).toBe(false);
    expect(params.has("b")).toBe(false);
    expect(params.get("c")).toBe("ok");
  });
});
