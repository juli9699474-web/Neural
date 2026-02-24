import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";
import { z } from "zod";

const prisma = new PrismaClient();
const app = Fastify({ logger: true });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_mock");

const safeGuard = (input: string) => !/(credential theft|malware|ransomware|keylogger)/i.test(input);

const modelAdapters = {
  openai: async (prompt: string) => `OpenAI response: ${prompt}`,
  anthropic: async (prompt: string) => `Anthropic response: ${prompt}`,
  google: async (prompt: string) => `Google response: ${prompt}`
};

app.register(cors, { origin: true });
app.register(sensible);
app.register(rateLimit, { max: 120, timeWindow: "1 minute" });

app.addHook("preHandler", async (req) => {
  const auth = req.headers.authorization;
  if (!auth) throw app.httpErrors.unauthorized("Missing Bearer token");
});

app.get("/health", async () => ({ ok: true }));

app.get("/projects", async () => {
  return prisma.project.findMany({ include: { tasks: true }, orderBy: { createdAt: "desc" } });
});

app.post("/projects", async (req) => {
  const body = z.object({ ownerId: z.string(), name: z.string(), description: z.string().optional() }).parse(req.body);
  return prisma.project.create({ data: body });
});

app.put("/projects/:id", async (req) => {
  const params = z.object({ id: z.string() }).parse(req.params);
  const body = z.object({ name: z.string().optional(), description: z.string().optional(), progress: z.number().min(0).max(100).optional() }).parse(req.body);
  return prisma.project.update({ where: { id: params.id }, data: body });
});

app.delete("/projects/:id", async (req) => {
  const params = z.object({ id: z.string() }).parse(req.params);
  await prisma.project.delete({ where: { id: params.id } });
  return { ok: true };
});

app.get("/projects/:projectId/tasks", async (req) => {
  const { projectId } = z.object({ projectId: z.string() }).parse(req.params);
  return prisma.task.findMany({ where: { projectId } });
});

app.post("/projects/:projectId/tasks", async (req) => {
  const { projectId } = z.object({ projectId: z.string() }).parse(req.params);
  const body = z.object({ title: z.string(), priority: z.enum(["low", "medium", "high"]).default("medium") }).parse(req.body);
  return prisma.task.create({ data: { ...body, projectId } });
});

app.patch("/tasks/:id", async (req) => {
  const { id } = z.object({ id: z.string() }).parse(req.params);
  const body = z.object({ status: z.enum(["todo", "doing", "done"]) }).parse(req.body);
  return prisma.task.update({ where: { id }, data: body });
});

app.post("/usage", async (req) => {
  const body = z.object({ userId: z.string(), projectId: z.string(), provider: z.string(), tokens: z.number(), costUsd: z.number() }).parse(req.body);
  return prisma.usageEvent.create({ data: body });
});

app.post("/chat/stream", async (req, reply) => {
  const body = z.object({ provider: z.enum(["openai", "anthropic", "google"]), prompt: z.string(), projectId: z.string(), actorId: z.string() }).parse(req.body);

  if (!safeGuard(body.prompt)) {
    await prisma.auditLog.create({
      data: {
        projectId: body.projectId,
        actorId: body.actorId,
        action: "chat_blocked",
        prompt: body.prompt,
        blocked: true,
        resultHash: createHash("sha256").update("blocked").digest("hex")
      }
    });
    return reply.code(400).send({ error: "Blocked by policy" });
  }

  const result = await modelAdapters[body.provider](body.prompt);
  const resultHash = createHash("sha256").update(result).digest("hex");
  await prisma.auditLog.create({
    data: {
      projectId: body.projectId,
      actorId: body.actorId,
      action: "chat_complete",
      prompt: body.prompt,
      toolCall: { provider: body.provider },
      resultHash
    }
  });

  reply.raw.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive"
  });
  for (const chunk of result.split(" ")) {
    reply.raw.write(`data: ${chunk}\n\n`);
  }
  reply.raw.end();
});

app.post("/orchestrator/run-step", async (req) => {
  const body = z.object({ projectId: z.string(), step: z.number().min(0).max(10) }).parse(req.body);
  const artifact = {
    step: body.step,
    output: `Executed planner -> builder -> verifier for step ${body.step}`,
    verifyCommand: "pnpm test"
  };
  await prisma.auditLog.create({
    data: {
      projectId: body.projectId,
      actorId: "system",
      action: "orchestrator_step",
      toolCall: artifact,
      resultHash: createHash("sha256").update(JSON.stringify(artifact)).digest("hex")
    }
  });
  return artifact;
});

app.post("/stripe/webhook", { config: { rawBody: true } }, async (req, reply) => {
  const sig = req.headers["stripe-signature"];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return reply.code(400).send({ error: "Webhook misconfigured" });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent((req as any).rawBody, sig, secret);
  } catch {
    return reply.code(400).send({ error: "Invalid signature" });
  }
  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    await prisma.subscription.upsert({
      where: { stripeSubscriptionId: sub.id },
      update: { status: sub.status },
      create: {
        userId: "seed-user",
        stripeCustomerId: String(sub.customer),
        stripeSubscriptionId: sub.id,
        status: sub.status,
        plan: sub.items.data[0]?.price.id ?? "unknown",
        currentPeriodEnd: new Date(sub.current_period_end * 1000)
      }
    });
  }
  return { received: true };
});

app.post("/executor/run", async (req) => {
  const body = z.object({ projectId: z.string(), command: z.string() }).parse(req.body);
  const allowed = [/^pnpm /, /^npm /, /^node /].some((re) => re.test(body.command));
  if (!allowed) throw app.httpErrors.forbidden("Command denied by sandbox allowlist");
  return {
    mode: "mock-local",
    networkEgressAllowlist: ["registry.npmjs.org", "api.openai.com", "api.anthropic.com"],
    command: body.command,
    status: "queued"
  };
});

app.listen({ port: Number(process.env.PORT ?? 4000), host: "0.0.0.0" });
