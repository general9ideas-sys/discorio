import { NextResponse } from "next/server";
import { getActiveEvent } from "@/lib/tickets";

export async function GET() {
  const event = await getActiveEvent();
  if (!event) return NextResponse.json({ error: "Sin evento" }, { status: 404 });
  return NextResponse.json(event);
}
