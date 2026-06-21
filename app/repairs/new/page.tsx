"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewRepairPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    machine_name: "",
    machine_model: "",
    machine_serial: "",
    symptom: "",
    root_cause: "",
    resolution: "",
    parts_replaced: "",
    downtime_minutes: "",
    technician_name: "",
    repair_date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.machine_name || !form.symptom || !form.resolution) {
      setError("Machine name, symptom, and resolution are required.");
      return;
    }

    setSaving(true);

    const res = await fetch("/api/repairs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (!res.ok) {
      setError("Failed to save repair.");
      return;
    }

    router.push("/repairs");
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Record Repair</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          ["machine_name", "Machine Name"],
          ["machine_model", "Machine Model"],
          ["machine_serial", "Machine Serial"],
          ["symptom", "Symptom"],
          ["root_cause", "Root Cause"],
          ["resolution", "Resolution / Repair Action"],
          ["parts_replaced", "Parts Replaced"],
          ["downtime_minutes", "Downtime Minutes"],
          ["technician_name", "Technician Name"],
          ["repair_date", "Repair Date"],
          ["notes", "Notes"],
        ].map(([field, label]) => (
          <div key={field}>
            <label className="mb-1 block font-medium">{label}</label>
            <textarea
              className="w-full rounded border p-2"
              rows={field === "notes" || field === "symptom" ? 3 : 1}
              value={(form as any)[field]}
              onChange={(e) => updateField(field, e.target.value)}
            />
          </div>
        ))}

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Repair"}
        </button>
      </form>
    </main>
  );
}