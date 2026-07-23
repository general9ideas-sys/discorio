import { CheckoutForm } from "@/components/CheckoutForm";
import { getActiveEvent } from "@/lib/tickets";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EntradasPage() {
  const event = await getActiveEvent();
  if (!event) {
    return (
      <div className="ticket-page">
        <p className="section-copy">No hay evento activo por ahora.</p>
        <Link href="/">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <CheckoutForm
      event={{
        id: event.id,
        name: event.name,
        date_iso: event.date_iso,
        venue: event.venue,
        price: event.price,
        remaining: event.remaining,
      }}
    />
  );
}
