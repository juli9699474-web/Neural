export interface NeuralClientOptions {
  baseUrl: string;
  token?: string;
}

export class NeuralClient {
  constructor(private readonly options: NeuralClientOptions) {}

  private async request(path: string, init?: RequestInit) {
    const res = await fetch(`${this.options.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(this.options.token ? { Authorization: `Bearer ${this.options.token}` } : {}),
        ...(init?.headers ?? {})
      }
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
  }

  projects() {
    return this.request("/projects");
  }

  tasks(projectId: string) {
    return this.request(`/projects/${projectId}/tasks`);
  }

  runBuilderStep(projectId: string, step: number) {
    return this.request(`/orchestrator/run-step`, {
      method: "POST",
      body: JSON.stringify({ projectId, step })
    });
  }
}
