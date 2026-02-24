import { describe, expect, it } from "vitest";
import { routeModel } from "./ai-router";

describe("routeModel", () => {
  it("routes to anthropic adapter", async () => {
    const result = await routeModel("anthropic", "hello");
    expect(result).toContain("Anthropic");
  });
});
