import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  buildRepairOrQuery,
  rankRepairs,
  repairSearchText,
  searchTermsForRepair,
} from "@/lib/repairMatching";

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

  const terms = searchTermsForRepair(currentRepair);

  if (terms.length === 0) {
    return NextResponse.json({ repairs: [] });
  }

  const { data, error } = await supabaseAdmin
    .from("repair_records")
    .select("*")
    .neq("id", id)
    .or(buildRepairOrQuery(terms))
    .limit(25);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    repairs: rankRepairs(repairSearchText(currentRepair), data || [], 5),
  });
}
