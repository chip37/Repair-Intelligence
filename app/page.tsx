import DashboardWorkspace from "./DashboardWorkspace";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Repair = {
  id: string;
  machine_name: string | null;
  symptom: string | null;
  root_cause: string | null;
  resolution: string | null;
  downtime_minutes: number | null;
  repair_date: string | null;
};

async function getRepairs() {
  const { data, error } = await supabaseAdmin
    .from("repair_records")
    .select(
      "id,machine_name,symptom,root_cause,resolution,downtime_minutes,repair_date"
    )
    .order("repair_date", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}

function getMostCommonFailure(repairs: Repair[]) {
  const counts = repairs.reduce<Record<string, number>>((totals, repair) => {
    const failure = repair.root_cause?.trim() || repair.symptom?.trim();

    if (!failure) {
      return totals;
    }

    totals[failure] = (totals[failure] || 0) + 1;
    return totals;
  }, {});

  return (
    Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "Not enough data"
  );
}

export default async function DashboardPage() {
  const repairs = await getRepairs();
  const recentRepairs = repairs.slice(0, 5);

  const stats = {
    totalRepairs: repairs.length,
    totalDowntime: repairs.reduce(
      (sum, repair) => sum + (repair.downtime_minutes || 0),
      0
    ),
    machinesTracked: new Set(
      repairs.map((repair) => repair.machine_name).filter(Boolean)
    ).size,
    mostCommonFailure: getMostCommonFailure(repairs),
  };

  return (
    <DashboardWorkspace recentRepairs={recentRepairs} stats={stats} />
  );
}
