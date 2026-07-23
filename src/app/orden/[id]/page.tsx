import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderBundle } from "@/lib/tickets";
import { ticketQrDataUrl } from "@/lib/notify";

export const dynamic = "force-dynamic";

export default async function OrdenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bundle = await getOrderBundle(id);
  if (!bundle) notFound();

  const { order, event, tickets } = bundle;
  const qrs = await Promise.all(tickets.map((t) => ticketQrDataUrl(t.code)));

  return (
    <div className="ticket-page">
      <header className="ticket-topbar">
        <Link href="/" className="logo-mark">
          <img src="/assets/logo-disco-rio-dark.png" alt="Disco Río" />
        </Link>
        <Link href="/entradas">Comprar más</Link>
      </header>

      <div className="order-hero">
        <p className="section-label">
          {order.status === "paid" ? "Compra confirmada" : "Pago pendiente"}
        </p>
        <h1 className="section-title">{event?.name || "Disco Río"}</h1>
        <p className="section-copy">
          Hola {order.buyer_name}.{" "}
          {order.status === "paid"
            ? "Mostrá estos QR en la puerta. También te mandamos el link por email."
            : "Si acabás de pagar, esperá unos segundos y recargá."}
        </p>
      </div>

      {order.status === "paid" ? (
        <div className="qr-grid">
          {tickets.map((ticket, i) => (
            <article className="qr-card" key={ticket.id}>
              <img src={qrs[i]} alt={`QR entrada ${ticket.code}`} />
              <p className="qr-code">{ticket.code}</p>
              <p className="ticket-meta">
                Estado: {ticket.status === "valid" ? "Válida" : "Usada"}
              </p>
              <Link className="btn btn-ghost dark" href={`/entrada/${ticket.code}`}>
                Abrir entrada
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <p className="form-note">Orden #{order.id.slice(0, 8)} · estado {order.status}</p>
      )}
    </div>
  );
}
