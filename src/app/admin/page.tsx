import Link from "next/link";
import { listPaidOrders } from "@/lib/tickets";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const orders = await listPaidOrders();

  return (
    <div className="ticket-page">
      <header className="ticket-topbar">
        <Link href="/" className="logo-mark">
          <img src="/assets/logo-disco-rio-dark.png" alt="Disco Río" />
        </Link>
        <Link href="/admin/scan">Ir a scanner</Link>
      </header>

      <p className="section-label">Admin</p>
      <h1 className="section-title">Ventas pagadas</h1>

      <div className="admin-table">
        {orders.length === 0 ? (
          <p className="section-copy">Todavía no hay compras pagadas.</p>
        ) : (
          <ul>
            {orders.map((o) => (
              <li key={o.id}>
                <div>
                  <strong>{o.buyer_name}</strong>
                  <span>{o.buyer_email}</span>
                </div>
                <div>
                  {o.quantity} entrada{o.quantity > 1 ? "s" : ""} · $
                  {o.total.toLocaleString("es-AR")}
                </div>
                <Link href={`/orden/${o.id}`}>Ver QR</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
