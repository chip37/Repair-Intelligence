import DeleteRepairButton from "./DeleteRepairButton";
import SimilarRepairs from "./SimilarRepairs";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getRepair(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/repairs/${id}`,
    { cache: "no-store" }
  );

  return res.json();
}

export default async function RepairDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { repair, error } = await getRepair(id);

  if (!repair) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <a href="/repairs" className="mb-6 inline-block underline">
          ← Back to Repair History
        </a>
        <h1 className="text-2xl font-bold">Repair not found</h1>
        <p>{error || "No repair record was returned."}</p>
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-3xl p-6">
      <a href="/repairs" className="mb-6 inline-block underline">
        ← Back to Repair History
      </a>

      <h1 className="mb-6 text-3xl font-bold">Repair Details</h1>

      <div className="space-y-3 rounded border p-4">
        <p><strong>Machine Name:</strong> {repair.machine_name}</p>
        <p><strong>Machine Model:</strong> {repair.machine_model}</p>
        <p><strong>Machine Serial:</strong> {repair.machine_serial}</p>
        <p><strong>Symptom:</strong> {repair.symptom}</p>
        <p><strong>Root Cause:</strong> {repair.root_cause}</p>
        <p><strong>Resolution:</strong> {repair.resolution}</p>
        <p><strong>Parts Replaced:</strong> {repair.parts_replaced}</p>
        <p><strong>Downtime Minutes:</strong> {repair.downtime_minutes}</p>
        <p><strong>Technician:</strong> {repair.technician_name}</p>
        <p><strong>Repair Date:</strong> {repair.repair_date}</p>
        <p><strong>Notes:</strong> {repair.notes}</p>
      </div>
      <DeleteRepairButton id={repair.id} />
      <a
  href={`/repairs/${repair.id}/edit`}
  className="mr-3 mt-6 inline-block rounded bg-black px-4 py-2 text-white"
>
  Edit Repair
</a>
<SimilarRepairs id={repair.id} />
    </main>
  );
}