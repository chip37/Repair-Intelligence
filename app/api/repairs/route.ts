import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("repair_records")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ repairs: data });
}

export async function POST(req: Request) {
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from("repair_records")
    .insert({
      machine_name: body.machine_name,
      machine_model: body.machine_model,
      machine_serial: body.machine_serial,
      symptom: body.symptom,
      root_cause: body.root_cause,
      resolution: body.resolution,
      parts_replaced: body.parts_replaced,
      downtime_minutes: body.downtime_minutes ? Number(body.downtime_minutes) : null,
      technician_name: body.technician_name,
      repair_date: body.repair_date || new Date().toISOString().slice(0, 10),
      notes: body.notes
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ repair: data });
}