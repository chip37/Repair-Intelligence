"use client";

import { useEffect, useState } from "react";

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
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Repair History</h1>

      <a
        href="/repairs/new"
        className="mb-6 inline-block rounded bg-black px-4 py-2 text-white"
      >
        Record New Repair
      </a>

      <input
        type="text"
        placeholder="Search by machine, symptom, or technician..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 w-full rounded border p-3"
      />

      <div className="space-y-4">
        {filteredRepairs.map((repair) => (
          <div key={repair.id} className="rounded border p-4">
            <h2 className="text-xl font-semibold">{repair.machine_name}</h2>
            <p><strong>Symptom:</strong> {repair.symptom}</p>
            <p><strong>Resolution:</strong> {repair.resolution}</p>
            <p><strong>Technician:</strong> {repair.technician_name}</p>
            <p><strong>Date:</strong> {repair.repair_date}</p>

            <a
              href={`/repairs/${repair.id}`}
              className="mt-3 inline-block rounded bg-black px-3 py-2 text-white"
            >
              View Details
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}