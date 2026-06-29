import OpenAI from "openai";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  buildRepairOrQuery,
  rankRepairs,
  repairSearchText,
  searchTermsForText,
  type RepairRecord,
} from "@/lib/repairMatching";

const NO_MATCH_MESSAGE = "No matching repair records found.";

function serializeRepairForAi(repair: RepairRecord, index: number) {
  return {
    reference: `Record ${index + 1}`,
    id: repair.id,
    machine_name: repair.machine_name || null,
    machine_model: repair.machine_model || null,
    machine_serial: repair.machine_serial || null,
    symptom: repair.symptom || null,
    root_cause: repair.root_cause || null,
    resolution: repair.resolution || null,
    parts_replaced: repair.parts_replaced || null,
    downtime_minutes: repair.downtime_minutes || null,
    technician_name: repair.technician_name || null,
    repair_date: repair.repair_date || null,
    notes: repair.notes || null,
  };
}

function fallbackGroundedAnswer(question: string, repairs: RepairRecord[]) {
  const lines = repairs.map((repair, index) => {
    return `Record ${index + 1}: ${repair.machine_name || "Unknown machine"} on ${
      repair.repair_date || "unknown date"
    }. Symptom: ${repair.symptom || "not recorded"}. Root cause: ${
      repair.root_cause || "not recorded"
    }. Resolution: ${repair.resolution || "not recorded"}.`;
  });

  return [
    "Assessment",
    `I found ${repairs.length} matching repair record${repairs.length === 1 ? "" : "s"} for "${question}". I could not generate the full AI recommendation, so use the supporting repair history below as the source of truth.`,
    "",
    "Most likely cause",
    "Confidence is low because the AI recommendation step did not complete. Review the root causes in the matching records before deciding.",
    "",
    "Recommended troubleshooting order",
    [
      "1. Compare the current symptom to the matching repair records.",
      "2. Check any repeated root causes and parts listed in those records.",
      "3. Try the prior successful fixes only when the current machine and symptom line up.",
    ].join("\n"),
    "",
    "Previous successful fixes",
    "See the resolutions listed in the supporting repair history.",
    "",
    "Confidence",
    "Low. The recommendation is limited to the matched repair records and the AI summary was unavailable.",
    "",
    "Why I recommended this",
    "The only evidence available is the matched repair history returned by the existing search logic.",
    "",
    "Supporting repair history",
    ...lines,
  ].join("\n");
}

async function buildAiRecommendation(question: string, repairs: RepairRecord[]) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const client = new OpenAI({ apiKey });
  const supportingRecords = repairs.map(serializeRepairForAi);

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: [
          "You are a senior maintenance technician explaining a recommendation to another technician.",
          "Use only the matching repair records provided by the application.",
          "Do not use outside knowledge. Do not invent repairs, symptoms, causes, parts, machines, or fixes.",
          "If evidence is weak, sparse, conflicting, or only loosely related, clearly say confidence is low.",
          "Include the number of matching repair records in the Assessment section.",
          "Keep supporting repair records visible in the answer by referencing their Record number and key details.",
          "Be practical and concise: explain what you would check first and why, like a senior maintenance technician.",
          "Return the answer with these exact section headings in this exact order: Assessment, Most likely cause, Recommended troubleshooting order, Previous successful fixes, Confidence, Why I recommended this, Supporting repair history.",
        ].join(" "),
      },
      {
        role: "user",
        content: JSON.stringify(
          {
            machine_problem: question,
            matching_repair_records: supportingRecords,
          },
          null,
          2
        ),
      },
    ],
  });

  return response.output_text.trim();
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
      answer: NO_MATCH_MESSAGE,
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
      answer: NO_MATCH_MESSAGE,
      repairs: [],
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY is missing. Add it to your environment to enable AI repair recommendations.",
      },
      { status: 500 }
    );
  }

  try {
    const answer = await buildAiRecommendation(question, matches);

    return NextResponse.json({
      answer,
      repairs: matches.map((repair) => ({
        ...repair,
        matched_text: repairSearchText(repair),
      })),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Unable to generate an AI repair recommendation.",
        answer: fallbackGroundedAnswer(question, matches),
        repairs: matches.map((repair) => ({
          ...repair,
          matched_text: repairSearchText(repair),
        })),
      },
      { status: 502 }
    );
  }
}
