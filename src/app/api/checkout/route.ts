import { NextResponse } from "next/server";
import { createCheckoutPreference } from "@/lib/mercadopago";
import {
  attachPreference,
  createPendingOrder,
  getActiveEvent,
} from "@/lib/tickets";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const buyerName = String(body.buyerName || "").trim();
    const buyerEmail = String(body.buyerEmail || "").trim().toLowerCase();
    const buyerPhone = String(body.buyerPhone || "").trim();
    const quantity = Number(body.quantity || 1);

    if (!buyerName || !buyerEmail) {
      return NextResponse.json({ error: "Nombre y email son obligatorios" }, { status: 400 });
    }

    const event = await getActiveEvent();
    if (!event || !event.active) {
      return NextResponse.json({ error: "No hay evento activo" }, { status: 404 });
    }

    const order = await createPendingOrder({
      eventId: event.id,
      buyerName,
      buyerEmail,
      buyerPhone,
      quantity,
    });

    const preference = await createCheckoutPreference(order, event);
    await attachPreference(order.id, preference.id);

    return NextResponse.json({
      orderId: order.id,
      checkoutUrl: preference.init_point,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al crear la orden";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
