"use client";

import Link from "next/link";
import { useState } from "react";

type Repair = {
  id: string;
  machine_name: string | null;
  symptom: string | null;
  root_cause: string | null;
  resolution: string | null;
  repair_date: string | null;
};

type Stats = {
  totalRepairs: number;
  totalDowntime: number;
  machinesTracked: number;
  mostCommonFailure: string;
};

const examples = [
  "Bent pins",
  "Terminal feed issue",
  "Crimp height variation",
  "Wire not inserting",
  "Applicator jam",
];

function RepairResult({ repair }: { repair: Repair }) {
  return (
    <article className="rounded border p-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="text-lg font-semibold">
          {repair.machine_name || "Unknown machine"}
        </h3>
        <Link href={`/repairs/${repair.id}`} className="text-sm underline">
          View detail
        </Link>
      </div>

      <dl className="grid gap-3 text-sm md:grid-cols-2">
        <div>
          <dt className="font-semibold">Symptom</dt>
          <dd>{repair.symptom || "Not recorded"}</dd>
        </div>
        <div>
          <dt className="font-semibold">Root Cause</dt>
          <dd>{repair.root_cause || "Not recorded"}</dd>
        </div>
        <div>
          <dt className="font-semibold">Resolution</dt>
          <dd>{repair.resolution || "Not recorded"}</dd>
        </div>
        <div>
          <dt className="font-semibold">Repair Date</dt>
          <dd>{repair.repair_date || "Not recorded"}</dd>
        </div>
      </dl>
    </article>
  );
}

export default function DashboardWorkspace({
  recentRepairs,
  stats,
}: {
  recentRepairs: Repair[];
  stats: Stats;
}) {
  const [question, setQuestion] = useState("");
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runSearch(problem: string) {
    const trimmedProblem = problem.trim();
    setQuestion(problem);
    setError("");
    setRepairs([]);

    if (!trimmedProblem) {
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: trimmedProblem }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Unable to search repair records.");
      return;
    }

    setRepairs(data.repairs || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await runSearch(question);
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Repair Intelligence</h1>
          <p className="mt-1 text-gray-600">
            Search known machine problems and reuse proven repair knowledge.
          </p>
        </div>

        <nav className="flex flex-wrap gap-3">
          <Link href="/repairs/new" className="rounded bg-black px-4 py-2 text-white">
            Record Repair
          </Link>
          <Link href="/repairs" className="rounded border px-4 py-2">
            Repair History
          </Link>
        </nav>
      </header>

      <section className="mb-6 rounded border p-5">
        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm text-gray-600">Total Repairs</p>
            <p className="text-2xl font-bold">{stats.totalRepairs}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Downtime</p>
            <p className="text-2xl font-bold">{stats.totalDowntime} min</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Machines Tracked</p>
            <p className="text-2xl font-bold">{stats.machinesTracked}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Most Common Failure</p>
            <p className="line-clamp-2 text-base font-semibold">
              {stats.mostCommonFailure}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="machine-problem" className="mb-2 block text-2xl font-bold">
              Ask a Machine Problem
            </label>
            <textarea
              id="machine-problem"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={5}
              placeholder="Describe the symptom, machine, tooling, alarm, or failed quality check..."
              className="w-full rounded border p-3"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => runSearch(example)}
                className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
              >
                {example}
              </button>
            ))}
          </div>

          {error && <p className="text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded bg-black px-5 py-3 text-white disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search Repair Records"}
          </button>
        </form>
      </section>

      {hasSearched && (
        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold">Matching Repair Results</h2>

          {loading && <p>Searching repair knowledge...</p>}

          {!loading && repairs.length === 0 && (
            <p>No matching repair records found.</p>
          )}

          <div className="space-y-4">
            {repairs.map((repair) => (
              <RepairResult key={repair.id} repair={repair} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-2xl font-bold">Recent Repair Knowledge</h2>

        <div className="space-y-4">
          {recentRepairs.map((repair) => (
            <RepairResult key={repair.id} repair={repair} />
          ))}
        </div>
      </section>
    </main>
  );
}
