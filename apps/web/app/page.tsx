"use client";
import { useState } from "react";
import { BUILDER_STEPS } from "@neural/shared";

const tabs = ["Chat", "Projects", "Tasks", "Builder", "Settings"] as const;

export default function HomePage() {
  const [tab, setTab] = useState<typeof tabs[number]>("Chat");
  const [messages, setMessages] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");

  return (
    <main className="mx-auto max-w-5xl p-4">
      <h1 className="mb-4 text-3xl font-bold">Neural Dashboard</h1>
      <div className="mb-4 flex gap-2 overflow-auto">
        {tabs.map((t) => (
          <button key={t} className={tab === t ? "bg-zinc-800" : ""} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === "Chat" && (
        <section className="space-y-3">
          <div className="rounded-xl border border-zinc-800 p-4">
            <p className="mb-2 text-sm text-zinc-400">Streaming chat + model selector</p>
            <select className="mb-2"><option>anthropic</option><option>openai</option><option>google</option></select>
            <div className="flex gap-2">
              <input className="flex-1" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ask Neural..." />
              <button onClick={() => { if (prompt) { setMessages((m) => [...m, prompt]); setPrompt(""); } }}>Send</button>
            </div>
            <ul className="mt-3 space-y-1 text-sm">{messages.map((m, i) => <li key={i}>• {m}</li>)}</ul>
          </div>
        </section>
      )}

      {tab === "Projects" && <section className="grid gap-2 md:grid-cols-2"><article className="rounded-xl border border-zinc-800 p-4">AI SaaS Starter (65%)</article></section>}
      {tab === "Tasks" && <section className="grid grid-cols-3 gap-3 text-sm"><div className="rounded-xl border p-3">todo</div><div className="rounded-xl border p-3">doing</div><div className="rounded-xl border p-3">done</div></section>}
      {tab === "Builder" && <section className="space-y-2">{BUILDER_STEPS.map((s) => <div key={s} className="flex items-center justify-between rounded-lg border border-zinc-800 p-3"><span>{s}</span><button>Verify</button></div>)}</section>}
      {tab === "Settings" && <section className="rounded-xl border border-zinc-800 p-4 text-sm">Default model, streaming toggle, appearance, usage stats.</section>}
    </main>
  );
}
