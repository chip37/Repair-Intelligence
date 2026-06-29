import OpenAI from "openai";
import { NextResponse } from "next/server";

type ExtractedRepairDetails = {
  machine_name: string | null;
  machine_type: string | null;
  machine_model: string | null;
  machine_serial: string | null;
  symptom: string | null;
  root_cause: string | null;
  resolution: string | null;
  parts_replaced: string | null;
  downtime_minutes: number | null;
  technician_name: string | null;
  repair_date: string | null;
  notes: string | null;
  failure_category: string | null;
  component_category: string | null;
};

const emptyDetails: ExtractedRepairDetails = {
  machine_name: null,
  machine_type: null,
  machine_model: null,
  machine_serial: null,
  symptom: null,
  root_cause: null,
  resolution: null,
  parts_replaced: null,
  downtime_minutes: null,
  technician_name: null,
  repair_date: null,
  notes: null,
  failure_category: null,
  component_category: null,
};

const allowedKeys = Object.keys(emptyDetails) as Array<keyof ExtractedRepairDetails>;

function normalizeExtractedDetails(value: unknown): ExtractedRepairDetails {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return emptyDetails;
  }

  const source = value as Record<string, unknown>;
  const details = { ...emptyDetails };

  for (const key of allowedKeys) {
    const fieldValue = source[key];

    if (key === "downtime_minutes") {
      details[key] =
        typeof fieldValue === "number" && Number.isFinite(fieldValue)
          ? fieldValue
          : null;
      continue;
    }

    details[key] = typeof fieldValue === "string" ? fieldValue : null;
  }

  return details;
}

export async function POST(req: Request) {
  const body = await req.json();
  const note = String(body.note || "").trim();

  if (!note) {
    return NextResponse.json({ error: "Repair note is required" }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY is missing. Add it to your environment to enable repair detail extraction.",
      },
      { status: 500 }
    );
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: [
            "Extract structured repair details from a technician note.",
            "Return only valid JSON. Do not include markdown.",
            "Use only information clearly present in the note. Do not invent values.",
            "If a field is not clearly present, return null or an empty string.",
            "For downtime_minutes, return a number of minutes or null.",
            "For repair_date, return YYYY-MM-DD only when clearly present, otherwise null.",
            "Return exactly these keys: machine_name, machine_type, machine_model, machine_serial, symptom, root_cause, resolution, parts_replaced, downtime_minutes, technician_name, repair_date, notes, failure_category, component_category.",
          ].join(" "),
        },
        {
          role: "user",
          content: note,
        },
      ],
    });

    const parsed = JSON.parse(response.output_text);

    return NextResponse.json({ fields: normalizeExtractedDetails(parsed) });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to extract repair details from the note." },
      { status: 502 }
    );
  }
}
