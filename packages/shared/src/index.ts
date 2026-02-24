export const BUILDER_STEPS = [
  "Step 0: Idea intake + constraints",
  "Step 1: Plan + architecture",
  "Step 2: Repo scaffold",
  "Step 3: Frontend build",
  "Step 4: Backend build",
  "Step 5: DB + migrations",
  "Step 6: Integrations",
  "Step 7: Testing + verification",
  "Step 8: Deploy",
  "Step 9: Mobile packaging",
  "Step 10: Store submission"
] as const;

export type ModelProvider = "openai" | "anthropic" | "google";

export interface UsageEvent {
  userId: string;
  projectId: string;
  provider: ModelProvider;
  tokens: number;
  costUsd: number;
}
