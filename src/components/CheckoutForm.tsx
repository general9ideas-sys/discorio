"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

type EventInfo = {
  id: string;
  name: string;
  date_iso: string;
  venue: string;
  price: number;
  remaining: number;
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function CheckoutForm({ event }: { event: EventInfo }) {
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = useMemo(() => event.price * quantity, [event.price, quantity]);
  const maxQty = Math.min(10, Math.max(1, event.remaining));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyerName, buyerEmail, buyerPhone, quantity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo iniciar el pago");
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setLoading(false);
    }
  }

  return (
    <div className="ticket-page">
      <header className="ticket-topbar">
        <Link href="/" className="logo-mark">
          <img src="/assets/logo-disco-rio-dark.png" alt="Disco Río" />
        </Link>
        <Link href="/">Volver</Link>
      </header>

      <div className="ticket-layout">
        <div>
          <p className="section-label">Entradas</p>
          <h1 className="section-title">{event.name}</h1>
          <p className="section-copy">
            {formatDate(event.date_iso)}
            <br />
            {event.venue}
          </p>
          <p className="ticket-price">
            ${event.price.toLocaleString("es-AR")} <span>c/u</span>
          </p>
          <p className="ticket-meta">{event.remaining} disponibles</p>
        </div>

        <form className="checkout-form" onSubmit={onSubmit}>
          <label>
            Nombre completo
            <input
              required
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="Tu nombre"
            />
          </label>
          <label>
            Email
            <input
              required
              type="email"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              placeholder="tu@email.com"
            />
          </label>
          <label>
            WhatsApp (opcional)
            <input
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              placeholder="+54 9 ..."
            />
          </label>
          <label>
            Cantidad
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            >
              {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <div className="checkout-total">
            Total: <strong>${total.toLocaleString("es-AR")}</strong>
          </div>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="btn btn-primary" type="submit" disabled={loading || event.remaining < 1}>
            {loading ? "Redirigiendo…" : "Pagar con tarjeta"}
          </button>
          <p className="form-note">
            Pago seguro. Al confirmar recibís tus QR en pantalla y por email.
          </p>
        </form>
      </div>
    </div>
  );
}
