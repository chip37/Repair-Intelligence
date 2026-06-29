"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RepairSummaryCard from "../components/RepairSummaryCard";

type Repair = {
  id: string;
  machine_name: string;
  symptom: string;
  resolution: string;
  technician_name: string;
  repair_date: string;
};

export default function RepairsPage() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadRepairs() {
      const res = await fetch("/api/repairs");
      const data = await res.json();
      setRepairs(data.repairs || []);
    }

    loadRepairs();
  }, []);

  const filteredRepairs = repairs.filter((repair) => {
    const text = `
      ${repair.machine_name}
      ${repair.symptom}
      ${repair.technician_name}
    `.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Repair Knowledge
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Repair History
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Search previously recorded repairs by machine, symptom, or
            technician.
          </p>
        </div>

        <Link
          href="/repairs/new"
          className="inline-flex min-h-11 items-center justify-center rounded bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Record New Repair
        </Link>
      </header>

      <section className="mb-6 rounded border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <label
          htmlFor="repair-search"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Search repair records
        </label>
        <input
          id="repair-search"
          type="text"
          placeholder="Search by machine, symptom, or technician..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-h-11 w-full rounded border border-slate-300 bg-white px-3 text-sm text-slate-950 transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
        />
        <p className="mt-3 text-sm text-slate-600">
          Showing {filteredRepairs.length} of {repairs.length} repair records.
        </p>
      </section>

      {filteredRepairs.length === 0 ? (
        <section className="rounded border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-950">
            No repair records found
          </h2>
          <p className="mt-2 text-slate-600">
            Try a different machine, symptom, or technician search.
          </p>
        </section>
      ) : (
        <section className="grid gap-4">
          {filteredRepairs.map((repair) => (
            <RepairSummaryCard key={repair.id} repair={repair} />
          ))}
        </section>
      )}
    </main>
  );
}
