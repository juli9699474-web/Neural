#!/usr/bin/env node
import { NeuralClient } from "@neural/sdk";

const [cmd, ...args] = process.argv.slice(2);
const client = new NeuralClient({ baseUrl: process.env.NEURAL_API_URL ?? "http://localhost:4000", token: process.env.NEURAL_TOKEN });

async function main() {
  switch (cmd) {
    case "login":
      console.log("Set NEURAL_TOKEN env var from dashboard API key.");
      break;
    case "projects":
      if (args[0] === "list") console.log(await client.projects());
      break;
    case "project":
      if (args[0] === "open") console.log(`Open project ${args[1]} in dashboard`);
      break;
    case "builder":
      if (args[0] === "run-step") console.log(await client.runBuilderStep(args[2] ?? "", Number(args[1])));
      break;
    case "chat":
      if (args[0] === "--stream") console.log("Use: curl -N /chat/stream for streaming output");
      break;
    case "logs":
      if (args[0] === "tail") console.log("Use dashboard audit log viewer or /audit endpoint.");
      break;
    default:
      console.log("Commands: login | projects list | project open <id> | builder run-step <step> <projectId> | chat --stream | logs tail");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
