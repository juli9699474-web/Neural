import { describe, expect, it } from "vitest";
import { runAgentStep } from "./orchestrator";

describe("runAgentStep", () => {
  it("returns planner-builder-verifier chain", () => {
    const result = runAgentStep(3);
    expect(result.phases).toEqual(["planner", "builder", "verifier"]);
    expect(result.status).toBe("ok");
  });
});
