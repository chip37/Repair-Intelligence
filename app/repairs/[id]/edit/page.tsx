"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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

const sections: Array<{
  title: string;
  description: string;
  fields: Array<[keyof RepairForm, string]>;
}> = [
  {
    title: "Machine Information",
    description: "Identify the equipment and traceability details.",
    fields: [
      ["machine_name", "Machine Name"],
      ["machine_model", "Machine Model"],
      ["machine_serial", "Machine Serial"],
    ],
  },
  {
    title: "Problem",
    description: "Capture the symptom and confirmed cause.",
    fields: [
      ["symptom", "Symptom"],
      ["root_cause", "Root Cause"],
    ],
  },
  {
    title: "Repair Action",
    description: "Document what corrected the issue and which parts were used.",
    fields: [
      ["resolution", "Resolution / Repair Action"],
      ["parts_replaced", "Parts Replaced"],
    ],
  },
  {
    title: "Time and Notes",
    description: "Finish with downtime, technician, date, and supporting notes.",
    fields: [
      ["downtime_minutes", "Downtime Minutes"],
      ["technician_name", "Technician Name"],
      ["repair_date", "Repair Date"],
      ["notes", "Notes"],
    ],
  },
];

const tallFields = new Set<keyof RepairForm>([
  "symptom",
  "root_cause",
  "resolution",
  "parts_replaced",
  "notes",
]);

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
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
      <Link
        href={`/repairs/${id}`}
        className="mb-6 inline-block text-sm font-medium text-blue-700 underline"
      >
        Back to Repair Details
      </Link>

      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Repair Log
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Edit Repair
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Update the repair record while keeping the same machine, problem, and
          action workflow.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {sections.map((section) => (
          <section
            key={section.title}
            className={`rounded border bg-white p-4 shadow-sm sm:p-6 ${
              section.title === "Problem"
                ? "border-red-200"
                : section.title === "Repair Action"
                  ? "border-green-200"
                  : section.title === "Time and Notes"
                    ? "border-amber-200"
                    : "border-slate-200"
            }`}
          >
            <div className="mb-5">
              <h2
                className={`text-xl font-semibold ${
                  section.title === "Problem"
                    ? "text-red-800"
                    : section.title === "Repair Action"
                      ? "text-green-800"
                      : section.title === "Time and Notes"
                        ? "text-amber-800"
                        : "text-slate-950"
                }`}
              >
                {section.title}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {section.description}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {section.fields.map(([field, label]) => (
                <div
                  key={field}
                  className={tallFields.has(field) ? "md:col-span-2" : ""}
                >
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {label}
                  </label>
                  <textarea
                    className="w-full rounded border border-slate-300 bg-white p-3 text-sm leading-6 text-slate-950 transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                    rows={tallFields.has(field) ? 4 : 1}
                    value={form[field]}
                    onChange={(e) => updateField(field, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}

        {error && (
          <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3 rounded border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Machine name, symptom, and resolution are required.
          </p>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-11 items-center justify-center rounded bg-blue-700 px-5 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </main>
  );
}
