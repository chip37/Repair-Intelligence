import Link from "next/link";

export type RepairSummary = {
  id: string;
  machine_name: string | null;
  symptom: string | null;
  root_cause?: string | null;
  resolution: string | null;
  repair_date: string | null;
  technician_name?: string | null;
};

type RepairSummaryCardProps = {
  repair: RepairSummary;
  compact?: boolean;
};

export default function RepairSummaryCard({
  repair,
  compact = false,
}: RepairSummaryCardProps) {
  return (
    <article className="group rounded border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Machine
          </p>
          <h3 className="text-lg font-semibold text-slate-950">
            {repair.machine_name || "Unknown machine"}
          </h3>
        </div>

        <Link
          href={`/repairs/${repair.id}`}
          className="inline-flex min-h-10 items-center justify-center rounded border border-blue-200 bg-blue-50 px-3 text-sm font-medium text-blue-800 transition hover:bg-blue-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          View Detail
        </Link>
      </div>

      <dl className={`grid gap-3 text-sm ${compact ? "" : "md:grid-cols-2"}`}>
        <div className="rounded border border-slate-200 bg-slate-50 p-3">
          <dt className="font-semibold text-slate-700">Symptom</dt>
          <dd className="mt-1 leading-6 text-slate-900">
            {repair.symptom || "Not recorded"}
          </dd>
        </div>

        {repair.root_cause !== undefined && (
          <div className="rounded border border-red-200 bg-red-50 p-3">
            <dt className="font-semibold text-red-700">Root Cause</dt>
            <dd className="mt-1 leading-6 text-slate-900">
              {repair.root_cause || "Not recorded"}
            </dd>
          </div>
        )}

        <div className="rounded border border-green-200 bg-green-50 p-3">
          <dt className="font-semibold text-green-700">Resolution</dt>
          <dd className="mt-1 leading-6 text-slate-900">
            {repair.resolution || "Not recorded"}
          </dd>
        </div>

        <div className="rounded border border-slate-200 bg-slate-50 p-3">
          <dt className="font-semibold text-slate-700">Repair Date</dt>
          <dd className="mt-1 leading-6 text-slate-900">
            {repair.repair_date || "Not recorded"}
          </dd>
        </div>

        {repair.technician_name !== undefined && (
          <div className="rounded border border-slate-200 bg-slate-50 p-3">
            <dt className="font-semibold text-slate-700">Technician</dt>
            <dd className="mt-1 leading-6 text-slate-900">
              {repair.technician_name || "Not recorded"}
            </dd>
          </div>
        )}
      </dl>
    </article>
  );
}
