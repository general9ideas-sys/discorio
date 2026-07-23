import { randomUUID } from "crypto";
import { isDemoMode } from "./env";
import { demoDb } from "./demo-db";
import { getSupabaseAdmin } from "./supabase";
import type { EventRow, OrderRow, TicketRow } from "./types";

function mapEvent(row: Record<string, unknown>): EventRow {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    date_iso: String(row.date_iso),
    venue: String(row.venue),
    price: Number(row.price ?? row.price_cents ?? 0),
    capacity: Number(row.capacity),
    active: Boolean(row.active),
  };
}

export async function getActiveEvent(): Promise<(EventRow & { sold: number; remaining: number }) | null> {
  if (isDemoMode()) {
    const event = await demoDb.getActiveEvent();
    if (!event) return null;
    const sold = await demoDb.countSold(event.id);
    return { ...event, sold, remaining: Math.max(0, event.capacity - sold) };
  }

  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data: event } = await sb
    .from("events")
    .select("*")
    .eq("active", true)
    .order("date_iso", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!event) return null;
  const mapped = mapEvent(event);
  const { count } = await sb
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("event_id", mapped.id);
  const sold = count || 0;
  return { ...mapped, sold, remaining: Math.max(0, mapped.capacity - sold) };
}

export async function createPendingOrder(input: {
  eventId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  quantity: number;
}) {
  const event = isDemoMode()
    ? await demoDb.getEventById(input.eventId)
    : null;

  let price = 0;
  let capacity = 0;
  let sold = 0;

  if (isDemoMode()) {
    if (!event) throw new Error("Evento no encontrado");
    price = event.price;
    capacity = event.capacity;
    sold = await demoDb.countSold(event.id);
  } else {
    const sb = getSupabaseAdmin();
    if (!sb) throw new Error("Supabase no configurado");
    const { data } = await sb.from("events").select("*").eq("id", input.eventId).single();
    if (!data) throw new Error("Evento no encontrado");
    const mapped = mapEvent(data);
    price = mapped.price;
    capacity = mapped.capacity;
    const { count } = await sb
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .eq("event_id", mapped.id);
    sold = count || 0;
  }

  if (input.quantity < 1 || input.quantity > 10) {
    throw new Error("Cantidad inválida");
  }
  if (sold + input.quantity > capacity) {
    throw new Error("No hay cupos suficientes");
  }

  const total = price * input.quantity;

  if (isDemoMode()) {
    return demoDb.createOrder({
      event_id: input.eventId,
      buyer_name: input.buyerName,
      buyer_email: input.buyerEmail,
      buyer_phone: input.buyerPhone || null,
      quantity: input.quantity,
      total,
    });
  }

  const sb = getSupabaseAdmin()!;
  const { data, error } = await sb
    .from("orders")
    .insert({
      event_id: input.eventId,
      buyer_name: input.buyerName,
      buyer_email: input.buyerEmail,
      buyer_phone: input.buyerPhone || null,
      quantity: input.quantity,
      total,
      status: "pending",
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return {
    id: data.id,
    event_id: data.event_id,
    buyer_name: data.buyer_name,
    buyer_email: data.buyer_email,
    buyer_phone: data.buyer_phone,
    quantity: data.quantity,
    total: Number(data.total ?? data.total_cents),
    status: data.status,
    mp_preference_id: data.mp_preference_id,
    mp_payment_id: data.mp_payment_id,
    created_at: data.created_at,
    paid_at: data.paid_at,
  } satisfies OrderRow;
}

export async function attachPreference(orderId: string, preferenceId: string) {
  if (isDemoMode()) {
    return demoDb.updateOrder(orderId, { mp_preference_id: preferenceId });
  }
  const sb = getSupabaseAdmin()!;
  await sb.from("orders").update({ mp_preference_id: preferenceId }).eq("id", orderId);
}

export async function markOrderPaid(orderId: string, paymentId?: string) {
  if (isDemoMode()) {
    const order = await demoDb.updateOrder(orderId, {
      status: "paid",
      mp_payment_id: paymentId || `demo-${Date.now()}`,
      paid_at: new Date().toISOString(),
    });
    if (!order) throw new Error("Orden no encontrada");
    const tickets = await demoDb.issueTickets(order);
    return { order, tickets };
  }

  const sb = getSupabaseAdmin()!;
  const { data: order } = await sb.from("orders").select("*").eq("id", orderId).single();
  if (!order) throw new Error("Orden no encontrada");
  if (order.status === "paid") {
    const { data: tickets } = await sb.from("tickets").select("*").eq("order_id", orderId);
    return {
      order: order as OrderRow,
      tickets: (tickets || []) as TicketRow[],
    };
  }

  await sb
    .from("orders")
    .update({
      status: "paid",
      mp_payment_id: paymentId || null,
      paid_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  const ticketsPayload = Array.from({ length: order.quantity }, () => ({
    order_id: orderId,
    event_id: order.event_id,
    code: randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase(),
    status: "valid",
  }));

  const { data: tickets, error } = await sb.from("tickets").insert(ticketsPayload).select("*");
  if (error) throw new Error(error.message);

  const { data: paidOrder } = await sb.from("orders").select("*").eq("id", orderId).single();
  return {
    order: {
      id: paidOrder.id,
      event_id: paidOrder.event_id,
      buyer_name: paidOrder.buyer_name,
      buyer_email: paidOrder.buyer_email,
      buyer_phone: paidOrder.buyer_phone,
      quantity: paidOrder.quantity,
      total: Number(paidOrder.total ?? paidOrder.total_cents),
      status: paidOrder.status,
      mp_preference_id: paidOrder.mp_preference_id,
      mp_payment_id: paidOrder.mp_payment_id,
      created_at: paidOrder.created_at,
      paid_at: paidOrder.paid_at,
    } satisfies OrderRow,
    tickets: tickets as TicketRow[],
  };
}

export async function getOrderBundle(orderId: string) {
  if (isDemoMode()) {
    const order = await demoDb.getOrder(orderId);
    if (!order) return null;
    const event = await demoDb.getEventById(order.event_id);
    const tickets = await demoDb.getTicketsByOrder(orderId);
    return { order, event, tickets };
  }

  const sb = getSupabaseAdmin()!;
  const { data: order } = await sb.from("orders").select("*").eq("id", orderId).single();
  if (!order) return null;
  const { data: event } = await sb.from("events").select("*").eq("id", order.event_id).single();
  const { data: tickets } = await sb.from("tickets").select("*").eq("order_id", orderId);
  return {
    order: {
      id: order.id,
      event_id: order.event_id,
      buyer_name: order.buyer_name,
      buyer_email: order.buyer_email,
      buyer_phone: order.buyer_phone,
      quantity: order.quantity,
      total: Number(order.total ?? order.total_cents),
      status: order.status,
      mp_preference_id: order.mp_preference_id,
      mp_payment_id: order.mp_payment_id,
      created_at: order.created_at,
      paid_at: order.paid_at,
    } satisfies OrderRow,
    event: event ? mapEvent(event) : null,
    tickets: (tickets || []) as TicketRow[],
  };
}

export async function validateTicket(code: string) {
  const clean = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!clean) return { ok: false as const, reason: "invalid" as const };

  if (isDemoMode()) {
    const existing = await demoDb.getTicketByCode(clean);
    if (!existing) return { ok: false as const, reason: "not_found" as const };
    if (existing.status === "used") {
      return { ok: false as const, reason: "already_used" as const, ticket: existing };
    }
    const result = await demoDb.markTicketUsed(clean);
    if (!result.ok) return result;
    const event = await demoDb.getEventById(result.ticket.event_id);
    return { ok: true as const, ticket: result.ticket, event };
  }

  const sb = getSupabaseAdmin()!;
  const { data: ticket } = await sb.from("tickets").select("*").eq("code", clean).maybeSingle();
  if (!ticket) return { ok: false as const, reason: "not_found" as const };
  if (ticket.status === "used") {
    return { ok: false as const, reason: "already_used" as const, ticket: ticket as TicketRow };
  }
  const { data: updated, error } = await sb
    .from("tickets")
    .update({ status: "used", used_at: new Date().toISOString() })
    .eq("id", ticket.id)
    .eq("status", "valid")
    .select("*")
    .maybeSingle();
  if (error || !updated) {
    return { ok: false as const, reason: "already_used" as const, ticket: ticket as TicketRow };
  }
  const { data: event } = await sb.from("events").select("*").eq("id", updated.event_id).single();
  return {
    ok: true as const,
    ticket: updated as TicketRow,
    event: event ? mapEvent(event) : null,
  };
}

export async function listPaidOrders() {
  if (isDemoMode()) {
    const orders = await demoDb.listOrders();
    return orders.filter((o) => o.status === "paid");
  }
  const sb = getSupabaseAdmin()!;
  const { data } = await sb
    .from("orders")
    .select("*")
    .eq("status", "paid")
    .order("paid_at", { ascending: false });
  return (data || []).map(
    (order): OrderRow => ({
      id: order.id,
      event_id: order.event_id,
      buyer_name: order.buyer_name,
      buyer_email: order.buyer_email,
      buyer_phone: order.buyer_phone,
      quantity: order.quantity,
      total: Number(order.total ?? order.total_cents),
      status: order.status,
      mp_preference_id: order.mp_preference_id,
      mp_payment_id: order.mp_payment_id,
      created_at: order.created_at,
      paid_at: order.paid_at,
    })
  );
}
