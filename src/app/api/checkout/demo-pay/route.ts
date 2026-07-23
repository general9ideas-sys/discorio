import { NextResponse } from "next/server";
import { markOrderPaid, getOrderBundle } from "@/lib/tickets";
import { sendTicketEmail } from "@/lib/notify";
import { siteUrl } from "@/lib/env";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.redirect(`${siteUrl()}/entradas?status=failure`);
  }

  try {
    const { order } = await markOrderPaid(orderId, `demo-${Date.now()}`);
    const bundle = await getOrderBundle(order.id);
    await sendTicketEmail({
      to: order.buyer_email,
      buyerName: order.buyer_name,
      orderId: order.id,
      eventName: bundle?.event?.name || "Disco Río",
    });
  } catch (error) {
    console.error(error);
  }

  return NextResponse.redirect(`${siteUrl()}/orden/${orderId}?status=success`);
}
