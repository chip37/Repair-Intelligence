import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  buildRepairOrQuery,
  rankRepairs,
  repairSearchText,
  searchTermsForText,
  type RepairRecord,
} from "@/lib/repairMatching";

function formatList(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])
  ).join("; ");
}

function buildGroundedAnswer(question: string, repairs: RepairRecord[]) {
  const causes = formatList(repairs.map((repair) => repair.root_cause));
  const resolutions = formatList(repairs.map((repair) => repair.resolution));
  const parts = formatList(repairs.map((repair) => repair.parts_replaced));
  const machines = formatList(repairs.map((repair) => repair.machine_name));

  const referenceLines = repairs
    .map((repair, index) => {
      return `${index + 1}. ${repair.machine_name || "Unknown machine"} on ${
        repair.repair_date || "unknown date"
      }: symptom was "${repair.symptom || "not recorded"}"; fix was "${
        repair.resolution || "not recorded"
      }".`;
    })
    .join("\n");

  return [
    `Based on ${repairs.length} matching repair record${
      repairs.length === 1 ? "" : "s"
    } for: "${question}"`,
    machines ? `Machines seen in the matching records: ${machines}.` : "",
    causes ? `Likely causes to check: ${causes}.` : "",
    parts ? `Parts commonly involved: ${parts}.` : "",
    resolutions ? `Repair actions that worked before: ${resolutions}.` : "",
    `Matching repair records:\n${referenceLines}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function POST(req: Request) {
  const body = await req.json();
  const question = String(body.question || "").trim();

  if (!question) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }

  const terms = searchTermsForText(question);

  if (terms.length === 0) {
    return NextResponse.json({
      answer: "No matching repair records found.",
      repairs: [],
    });
  }

  const { data, error } = await supabaseAdmin
    .from("repair_records")
    .select("*")
    .or(buildRepairOrQuery(terms))
    .limit(25);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const matches = rankRepairs(question, data || [], 5);

  if (matches.length === 0) {
    return NextResponse.json({
      answer: "No matching repair records found.",
      repairs: [],
    });
  }

  return NextResponse.json({
    answer: buildGroundedAnswer(question, matches),
    repairs: matches.map((repair) => ({
      ...repair,
      matched_text: repairSearchText(repair),
    })),
  });
}
