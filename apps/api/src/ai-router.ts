export type Provider = "openai" | "anthropic" | "google";

export async function routeModel(provider: Provider, prompt: string) {
  const adapters: Record<Provider, (p: string) => Promise<string>> = {
    openai: async (p) => `OpenAI response: ${p}`,
    anthropic: async (p) => `Anthropic response: ${p}`,
    google: async (p) => `Google response: ${p}`
  };
  return adapters[provider](prompt);
}
