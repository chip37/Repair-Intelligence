"use client";

import { useEffect, useState } from "react";

type Repair = {
  id: string;
  machine_name: string;
  symptom: string;
  resolution: string;
  repair_date: string;
};

export default function SimilarRepairs({ id }: { id: string }) {
  const [repairs, setRepairs] = useState<Repair[]>([]);

  useEffect(() => {
    async function loadSimilar() {
      const res = await fetch(`/api/repairs/similar?id=${id}`);
      const data = await res.json();
      setRepairs(data.repairs || []);
    }

    loadSimilar();
  }, [id]);

  return (
    <div className="mt-8 rounded border p-4">
      <h2 className="mb-4 text-2xl font-bold">Similar Repairs</h2>

      {repairs.length === 0 && <p>No similar repairs found yet.</p>}

      <div className="space-y-3">
        {repairs.map((repair) => (
          <a
            key={repair.id}
            href={`/repairs/${repair.id}`}
            className="block rounded border p-3 hover:bg-gray-50"
          >
            <p><strong>Machine:</strong> {repair.machine_name}</p>
            <p><strong>Symptom:</strong> {repair.symptom}</p>
            <p><strong>Fix:</strong> {repair.resolution}</p>
            <p><strong>Date:</strong> {repair.repair_date}</p>
          </a>
        ))}
      </div>
    </div>
  );
}