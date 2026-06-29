"use client";

import { useState } from "react";
import RepairSummaryCard from "./components/RepairSummaryCard";

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

export default function DashboardWorkspace({
  recentRepairs,
  stats,
}: {
  recentRepairs: Repair[];
  stats: Stats;
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runSearch(problem: string) {
    const trimmedProblem = problem.trim();
    setQuestion(problem);
    setError("");
    setAnswer("");
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

    setAnswer(data.answer || "");
    setRepairs(data.repairs || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await runSearch(question);
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6 lg:py-8">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Maintenance Troubleshooting
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Repair Intelligence
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
            Start with the machine symptom, then use prior repairs to narrow the
            likely cause and proven fix.
          </p>
        </div>
      </header>

      <section className="rounded border border-blue-200 bg-white p-4 shadow-sm ring-1 ring-blue-50 sm:p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="machine-problem"
                className="block text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
              >
                Ask a Machine Problem
              </label>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Describe the symptom, machine, tooling, alarm, or failed quality
                check. Results stay on this dashboard.
              </p>
            </div>

            <textarea
              id="machine-problem"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={6}
              placeholder="Example: Hanke crimper has terminal feed issues and occasional applicator jams..."
              className="min-h-40 w-full resize-y rounded border border-slate-300 bg-white p-4 text-base leading-7 text-slate-950 shadow-inner transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
            />

            <div className="flex flex-wrap gap-2">
              {examples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => runSearch(example)}
                  className="min-h-10 rounded-full border border-slate-300 bg-slate-50 px-3 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {example}
                </button>
              ))}
            </div>

            {error && (
              <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-12 w-full items-center justify-center rounded bg-blue-700 px-5 text-base font-semibold text-white transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 sm:w-auto"
            >
              {loading ? "Searching..." : "Search Repair Knowledge"}
            </button>
          </form>

          <aside className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              { label: "Total Repairs", value: stats.totalRepairs, className: "border-blue-200 bg-blue-50", labelClassName: "text-blue-700" },
              { label: "Total Downtime", value: `${stats.totalDowntime} min`, className: "border-amber-200 bg-amber-50", labelClassName: "text-amber-700" },
              { label: "Machines Tracked", value: stats.machinesTracked, className: "border-slate-200 bg-slate-50", labelClassName: "text-slate-500" },
              { label: "Most Common Failure", value: stats.mostCommonFailure, className: "border-red-200 bg-red-50", labelClassName: "text-red-700" },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`rounded border p-4 ${stat.className}`}
              >
                <p className={`text-xs font-semibold uppercase tracking-wide ${stat.labelClassName}`}>
                  {stat.label}
                </p>
                <p className="mt-1 text-xl font-bold leading-snug text-slate-950">
                  {stat.value}
                </p>
              </div>
            ))}
          </aside>
        </div>
      </section>

      {hasSearched && (
        <section>
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Recommendation
              </p>
              <h2 className="text-2xl font-bold text-slate-950">
                AI Repair Recommendation
              </h2>
            </div>
            {!loading && repairs.length > 0 && (
              <p className="text-sm text-slate-600">
                {repairs.length} matching record{repairs.length === 1 ? "" : "s"}
              </p>
            )}
          </div>

          {loading && (
            <p className="rounded border border-slate-200 bg-white p-4 text-slate-600">
              Searching repair knowledge...
            </p>
          )}

          {!loading && repairs.length === 0 && (
            <div className="rounded border border-dashed border-slate-300 bg-white p-6 text-slate-600">
              No matching repair records found.
            </div>
          )}

          {!loading && answer && repairs.length > 0 && (
            <div className="mb-6 rounded border border-blue-200 bg-white p-5 shadow-sm ring-1 ring-blue-50">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
                AI Summary
              </p>
              <div className="whitespace-pre-wrap text-sm leading-7 text-slate-900">
                {answer}
              </div>
            </div>
          )}

          {!loading && repairs.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-semibold text-slate-950">
                Supporting Matched Repair Records
              </h3>
              <div className="space-y-4">
                {repairs.map((repair) => (
                  <RepairSummaryCard key={repair.id} repair={repair} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <section>
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Recent Knowledge
            </p>
            <h2 className="text-2xl font-bold text-slate-950">
              Recent Repair Knowledge
            </h2>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {recentRepairs.map((repair) => (
            <RepairSummaryCard key={repair.id} repair={repair} compact />
          ))}
        </div>
      </section>
    </main>
  );
}
