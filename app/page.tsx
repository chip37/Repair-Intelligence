type Repair = {
  id: string;
  machine_name: string;
  symptom: string;
  resolution: string;
  downtime_minutes: number | null;
  repair_date: string;
};

async function getRepairs() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/repairs`,
    { cache: "no-store" }
  );

  return res.json();
}

export default async function DashboardPage() {
  const { repairs } = await getRepairs();

  const totalRepairs = repairs?.length || 0;

  const totalDowntime =
    repairs?.reduce(
      (sum: number, repair: Repair) => sum + (repair.downtime_minutes || 0),
      0
    ) || 0;

  const recentRepairs = repairs?.slice(0, 5) || [];

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Repair Intelligence</h1>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded border p-4">
          <p className="text-sm text-gray-600">Total Repairs</p>
          <p className="text-3xl font-bold">{totalRepairs}</p>
        </div>

        <div className="rounded border p-4">
          <p className="text-sm text-gray-600">Total Downtime</p>
          <p className="text-3xl font-bold">{totalDowntime} min</p>
        </div>

        <div className="rounded border p-4">
          <p className="text-sm text-gray-600">Quick Actions</p>
          <a href="/repairs/new" className="mt-2 inline-block underline">
            Record Repair
          </a>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <a href="/repairs" className="rounded bg-black px-4 py-2 text-white">
          View Repair History
        </a>

        <a href="/repairs/new" className="rounded border px-4 py-2">
          Record New Repair
        </a>
      </div>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Recent Repairs</h2>

        <div className="space-y-4">
          {recentRepairs.map((repair: Repair) => (
            <a
              key={repair.id}
              href={`/repairs/${repair.id}`}
              className="block rounded border p-4 hover:bg-gray-50"
            >
              <h3 className="text-xl font-semibold">{repair.machine_name}</h3>
              <p><strong>Symptom:</strong> {repair.symptom}</p>
              <p><strong>Fix:</strong> {repair.resolution}</p>
              <p><strong>Date:</strong> {repair.repair_date}</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}