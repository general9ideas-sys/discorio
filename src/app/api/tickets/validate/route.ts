import { NextResponse } from "next/server";
import { validateTicket } from "@/lib/tickets";
import { adminPin } from "@/lib/env";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const pin = String(body.pin || "");
    const code = String(body.code || "");

    if (pin !== adminPin()) {
      return NextResponse.json({ error: "PIN inválido" }, { status: 401 });
    }

    const result = await validateTicket(code);
    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          reason: result.reason,
          ticket: "ticket" in result ? result.ticket : null,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      ok: true,
      ticket: result.ticket,
      event: result.event,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
