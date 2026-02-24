export function runAgentStep(step: number) {
  const phases = ["planner", "builder", "verifier"];
  return {
    step,
    phases,
    status: "ok",
    artifact: `step-${step}-artifact.json`
  };
}
