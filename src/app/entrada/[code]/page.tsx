import Link from "next/link";
import { notFound } from "next/navigation";
import { demoDb } from "@/lib/demo-db";
import { isDemoMode } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase";
import { ticketQrDataUrl } from "@/lib/notify";

export const dynamic = "force-dynamic";

async function getTicket(code: string) {
  if (isDemoMode()) {
    const ticket = await demoDb.getTicketByCode(code);
    if (!ticket) return null;
    const event = await demoDb.getEventById(ticket.event_id);
    return { ticket, event };
  }
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data: ticket } = await sb.from("tickets").select("*").eq("code", code.toUpperCase()).maybeSingle();
  if (!ticket) return null;
  const { data: event } = await sb.from("events").select("*").eq("id", ticket.event_id).single();
  return { ticket, event };
}

export default async function EntradaPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const data = await getTicket(code);
  if (!data) notFound();
  const qr = await ticketQrDataUrl(data.ticket.code);

  return (
    <div className="ticket-page single-ticket">
      <img src={qr} alt={`QR ${data.ticket.code}`} className="qr-large" />
      <h1 className="section-title">{data.event?.name || "Disco Río"}</h1>
      <p className="qr-code">{data.ticket.code}</p>
      <p className="ticket-meta">
        {data.ticket.status === "valid" ? "Lista para ingresar" : "Ya utilizada"}
      </p>
      <Link href={`/orden/${data.ticket.order_id}`}>Ver todas mis entradas</Link>
    </div>
  );
}
