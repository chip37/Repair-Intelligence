import DeleteRepairButton from "./DeleteRepairButton";
import SimilarRepairs from "./SimilarRepairs";
import InfoBlock from "@/app/components/InfoBlock";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Link from "next/link";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getRepair(id: string) {
  const { data, error } = await supabaseAdmin
    .from("repair_records")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export default async function RepairDetailPage({ params }: PageProps) {
  const { id } = await params;
  const repair = await getRepair(id);

  if (!repair) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
        <Link
          href="/repairs"
          className="mb-6 inline-block text-sm font-medium text-blue-700 underline"
        >
          Back to Repair History
        </Link>
        <section className="rounded border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-950">Repair not found</h1>
          <p className="mt-2 text-slate-600">No repair record was returned.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
      <Link
        href="/repairs"
        className="mb-6 inline-block text-sm font-medium text-blue-700 underline"
      >
        Back to Repair History
      </Link>

      <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Repair Record
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {repair.machine_name || "Repair Details"}
          </h1>
          <p className="mt-2 text-slate-600">
            {repair.repair_date || "Date not recorded"} ·{" "}
            {repair.technician_name || "Technician not recorded"}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/repairs/${repair.id}/edit`}
            className="inline-flex min-h-11 items-center justify-center rounded bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Edit Repair
          </Link>
          <div className="[&_button]:mt-0 [&_button]:min-h-11 [&_button]:rounded [&_button]:px-4 [&_button]:text-sm [&_button]:font-semibold [&_button]:transition">
            <DeleteRepairButton id={repair.id} />
          </div>
        </div>
      </header>

      <div className="grid gap-5">
        <section className="rounded border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 text-xl font-semibold text-slate-950">
            Machine Information
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <InfoBlock label="Machine Name" value={repair.machine_name} variant="metadata" />
            <InfoBlock label="Machine Model" value={repair.machine_model} variant="metadata" />
            <InfoBlock label="Machine Serial" value={repair.machine_serial} variant="metadata" />
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <InfoBlock label="Problem" value={repair.symptom} variant="metadata" />
          <InfoBlock
            label="Root Cause"
            value={repair.root_cause}
            variant="rootCause"
          />
          <InfoBlock
            label="Resolution"
            value={repair.resolution}
            variant="resolution"
            className="lg:col-span-2"
          />
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <InfoBlock label="Parts Replaced" value={repair.parts_replaced} variant="metadata" />
          <InfoBlock
            label="Downtime"
            value={
              repair.downtime_minutes !== null &&
              repair.downtime_minutes !== undefined
                ? `${repair.downtime_minutes} minutes`
                : null
            }
            variant="downtime"
          />
        </section>

        <section className="rounded border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 text-xl font-semibold text-slate-950">Notes</h2>
          <p className="leading-7 text-slate-900">
            {repair.notes || "Not recorded"}
          </p>
        </section>
      </div>

      <SimilarRepairs id={repair.id} />
    </main>
  );
}
