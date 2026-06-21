import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("repair_records")
    .select("*")
    .limit(1);

  return NextResponse.json({
    success: !error,
    error,
    data
  });
}