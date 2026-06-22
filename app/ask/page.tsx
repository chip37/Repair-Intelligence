"use client";

import Link from "next/link";
import { useState } from "react";

type Repair = {
  id: string;
  machine_name: string | null;
  symptom: string | null;
  root_cause: string | null;
  resolution: string | null;
  parts_replaced: string | null;
  repair_date: string | null;
};

export default function AskPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setAnswer("");
    setRepairs([]);

    if (!question.trim()) {
      setError("Enter a machine problem first.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Unable to search repair records.");
      return;
    }

    setAnswer(data.answer || "No matching repair records found.");
    setRepairs(data.repairs || []);
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Link href="/" className="mb-6 inline-block underline">
        Back to Dashboard
      </Link>

      <h1 className="mb-3 text-3xl font-bold">Ask Repair Intelligence</h1>
      <p className="mb-6 text-gray-600">
        Describe the machine problem. Answers are based only on matching repair
        records.
      </p>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={5}
          placeholder="Example: Hanke crimper is making short crimps and the feed rollers hesitate."
          className="w-full rounded border p-3"
        />

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Searching..." : "Ask"}
        </button>
      </form>

      {answer && (
        <section className="space-y-6">
          <div className="rounded border p-4">
            <h2 className="mb-3 text-2xl font-bold">Troubleshooting Answer</h2>
            <div className="whitespace-pre-wrap">{answer}</div>
          </div>

          {repairs.length > 0 && (
            <div>
              <h2 className="mb-3 text-2xl font-bold">Matching Records</h2>
              <div className="space-y-3">
                {repairs.map((repair) => (
                  <a
                    key={repair.id}
                    href={`/repairs/${repair.id}`}
                    className="block rounded border p-3 hover:bg-gray-50"
                  >
                    <p>
                      <strong>Machine:</strong> {repair.machine_name}
                    </p>
                    <p>
                      <strong>Symptom:</strong> {repair.symptom}
                    </p>
                    <p>
                      <strong>Root Cause:</strong> {repair.root_cause}
                    </p>
                    <p>
                      <strong>Resolution:</strong> {repair.resolution}
                    </p>
                    <p>
                      <strong>Parts:</strong> {repair.parts_replaced}
                    </p>
                    <p>
                      <strong>Date:</strong> {repair.repair_date}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
