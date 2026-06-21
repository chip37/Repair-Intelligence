import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const { data, error } = await supabaseAdmin
    .from("repair_records")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ repair: data });
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const { error } = await supabaseAdmin
    .from("repair_records")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from("repair_records")
    .update({
      machine_name: body.machine_name,
      machine_model: body.machine_model,
      machine_serial: body.machine_serial,
      symptom: body.symptom,
      root_cause: body.root_cause,
      resolution: body.resolution,
      parts_replaced: body.parts_replaced,
      downtime_minutes: body.downtime_minutes
        ? Number(body.downtime_minutes)
        : null,
      technician_name: body.technician_name,
      repair_date: body.repair_date,
      notes: body.notes,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ repair: data });
}