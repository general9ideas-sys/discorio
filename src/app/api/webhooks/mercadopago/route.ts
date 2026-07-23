import { NextResponse } from "next/server";
import { getPayment } from "@/lib/mercadopago";
import { markOrderPaid } from "@/lib/tickets";
import { sendTicketEmail } from "@/lib/notify";
import { getOrderBundle } from "@/lib/tickets";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const topic = body.type || body.topic || new URL(req.url).searchParams.get("topic");
    const dataId =
      body?.data?.id ||
      body?.id ||
      new URL(req.url).searchParams.get("id") ||
      new URL(req.url).searchParams.get("data.id");

    if (String(topic).includes("payment") && dataId) {
      const payment = await getPayment(String(dataId));
      const status = payment.status;
      const orderId = payment.external_reference;
      if (status === "approved" && orderId) {
        const { order } = await markOrderPaid(String(orderId), String(payment.id));
        const bundle = await getOrderBundle(order.id);
        await sendTicketEmail({
          to: order.buyer_email,
          buyerName: order.buyer_name,
          orderId: order.id,
          eventName: bundle?.event?.name || "Disco Río",
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("MP webhook error", error);
    return NextResponse.json({ ok: true });
  }
}

export async function GET(req: Request) {
  return POST(req);
}
