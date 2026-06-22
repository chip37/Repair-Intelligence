"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type RepairForm = {
  machine_name: string;
  machine_model: string;
  machine_serial: string;
  symptom: string;
  root_cause: string;
  resolution: string;
  parts_replaced: string;
  downtime_minutes: string;
  technician_name: string;
  repair_date: string;
  notes: string;
};

const fields: Array<[keyof RepairForm, string]> = [
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
];

export default function EditRepairPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<RepairForm>({
    machine_name: "",
    machine_model: "",
    machine_serial: "",
    symptom: "",
    root_cause: "",
    resolution: "",
    parts_replaced: "",
    downtime_minutes: "",
    technician_name: "",
    repair_date: "",
    notes: "",
  });

  useEffect(() => {
    async function loadRepair() {
      const res = await fetch(`/api/repairs/${id}`);
      const data = await res.json();

      if (data.repair) {
        setForm({
          machine_name: data.repair.machine_name || "",
          machine_model: data.repair.machine_model || "",
          machine_serial: data.repair.machine_serial || "",
          symptom: data.repair.symptom || "",
          root_cause: data.repair.root_cause || "",
          resolution: data.repair.resolution || "",
          parts_replaced: data.repair.parts_replaced || "",
          downtime_minutes: data.repair.downtime_minutes?.toString() || "",
          technician_name: data.repair.technician_name || "",
          repair_date: data.repair.repair_date || "",
          notes: data.repair.notes || "",
        });
      }
    }

    loadRepair();
  }, [id]);

  function updateField(field: keyof RepairForm, value: string) {
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

    const res = await fetch(`/api/repairs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (!res.ok) {
      setError("Failed to update repair.");
      return;
    }

    router.push(`/repairs/${id}`);
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <a href={`/repairs/${id}`} className="mb-6 inline-block underline">
        ← Back to Repair Details
      </a>

      <h1 className="mb-6 text-3xl font-bold">Edit Repair</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(([field, label]) => (
          <div key={field}>
            <label className="mb-1 block font-medium">{label}</label>
            <textarea
              className="w-full rounded border p-2"
              rows={field === "notes" || field === "symptom" ? 3 : 1}
              value={form[field]}
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
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </main>
  );
}
