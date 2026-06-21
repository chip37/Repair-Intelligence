import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing repair id" }, { status: 400 });
  }

  const { data: currentRepair, error: currentError } = await supabaseAdmin
    .from("repair_records")
    .select("*")
    .eq("id", id)
    .single();

  if (currentError || !currentRepair) {
    return NextResponse.json({ error: "Repair not found" }, { status: 404 });
  }

  const terms = [
    currentRepair.symptom,
    currentRepair.root_cause,
    currentRepair.resolution,
    currentRepair.parts_replaced,
  ]
    .filter(Boolean)
    .join(" ")
    .split(" ")
    .filter((word) => word.length > 3)
    .slice(0, 5);

  const orQuery = terms
    .map(
      (term) =>
        `symptom.ilike.%${term}%,root_cause.ilike.%${term}%,resolution.ilike.%${term}%,parts_replaced.ilike.%${term}%`
    )
    .join(",");

  const { data, error } = await supabaseAdmin
    .from("repair_records")
    .select("*")
    .neq("id", id)
    .or(orQuery)
    .limit(5);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ repairs: data || [] });
}