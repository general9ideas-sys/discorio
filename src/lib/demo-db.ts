import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type { EventRow, OrderRow, TicketRow } from "./types";

type Store = {
  events: EventRow[];
  orders: OrderRow[];
  tickets: TicketRow[];
};

const storePath = path.join(process.cwd(), "data", "store.json");
const globalKey = "__discorio_demo_store__";

function memoryStore(): Store {
  const g = globalThis as unknown as Record<string, Store | undefined>;
  if (!g[globalKey]) {
    g[globalKey] = { events: [defaultEvent()], orders: [], tickets: [] };
  }
  return g[globalKey]!;
}

function useMemoryOnly() {
  return process.env.VERCEL === "1" || process.env.DEMO_MEMORY === "true";
}

function defaultEvent(): EventRow {
  return {
    id: "demo-event-1",
    slug: "proxima",
    name: process.env.DEMO_EVENT_NAME || "Disco Río — Fecha especial",
    date_iso: process.env.DEMO_EVENT_DATE || "2026-08-15T22:00:00-03:00",
    venue: process.env.DEMO_EVENT_VENUE || "El Pontón · Capri Nautic Club, Posadas",
    price: Number(process.env.DEMO_EVENT_PRICE || 8000),
    capacity: Number(process.env.DEMO_EVENT_CAPACITY || 200),
    active: true,
  };
}

async function readStore(): Promise<Store> {
  if (useMemoryOnly()) return memoryStore();
  try {
    const raw = await fs.readFile(storePath, "utf8");
    return JSON.parse(raw) as Store;
  } catch {
    const seed: Store = { events: [defaultEvent()], orders: [], tickets: [] };
    await writeStore(seed);
    return seed;
  }
}

async function writeStore(store: Store) {
  if (useMemoryOnly()) {
    const g = globalThis as unknown as Record<string, Store | undefined>;
    g[globalKey] = store;
    return;
  }
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

export const demoDb = {
  async getActiveEvent(): Promise<EventRow | null> {
    const store = await readStore();
    return store.events.find((e) => e.active) || store.events[0] || null;
  },

  async getEventById(id: string) {
    const store = await readStore();
    return store.events.find((e) => e.id === id) || null;
  },

  async countSold(eventId: string) {
    const store = await readStore();
    return store.tickets.filter((t) => t.event_id === eventId).length;
  },

  async createOrder(input: {
    event_id: string;
    buyer_name: string;
    buyer_email: string;
    buyer_phone: string | null;
    quantity: number;
    total: number;
  }): Promise<OrderRow> {
    const store = await readStore();
    const order: OrderRow = {
      id: randomUUID(),
      event_id: input.event_id,
      buyer_name: input.buyer_name,
      buyer_email: input.buyer_email,
      buyer_phone: input.buyer_phone,
      quantity: input.quantity,
      total: input.total,
      status: "pending",
      mp_preference_id: null,
      mp_payment_id: null,
      created_at: new Date().toISOString(),
      paid_at: null,
    };
    store.orders.push(order);
    await writeStore(store);
    return order;
  },

  async updateOrder(
    id: string,
    patch: Partial<OrderRow>
  ): Promise<OrderRow | null> {
    const store = await readStore();
    const idx = store.orders.findIndex((o) => o.id === id);
    if (idx < 0) return null;
    store.orders[idx] = { ...store.orders[idx], ...patch };
    await writeStore(store);
    return store.orders[idx];
  },

  async getOrder(id: string) {
    const store = await readStore();
    return store.orders.find((o) => o.id === id) || null;
  },

  async listOrders() {
    const store = await readStore();
    return [...store.orders].sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async issueTickets(order: OrderRow): Promise<TicketRow[]> {
    const store = await readStore();
    const existing = store.tickets.filter((t) => t.order_id === order.id);
    if (existing.length) return existing;

    const created: TicketRow[] = [];
    for (let i = 0; i < order.quantity; i++) {
      const ticket: TicketRow = {
        id: randomUUID(),
        order_id: order.id,
        event_id: order.event_id,
        code: randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase(),
        status: "valid",
        used_at: null,
        created_at: new Date().toISOString(),
      };
      created.push(ticket);
      store.tickets.push(ticket);
    }
    await writeStore(store);
    return created;
  },

  async getTicketsByOrder(orderId: string) {
    const store = await readStore();
    return store.tickets.filter((t) => t.order_id === orderId);
  },

  async getTicketByCode(code: string) {
    const store = await readStore();
    return store.tickets.find((t) => t.code.toUpperCase() === code.toUpperCase()) || null;
  },

  async markTicketUsed(code: string) {
    const store = await readStore();
    const idx = store.tickets.findIndex(
      (t) => t.code.toUpperCase() === code.toUpperCase()
    );
    if (idx < 0) return { ok: false as const, reason: "not_found" as const };
    const ticket = store.tickets[idx];
    if (ticket.status === "used") {
      return { ok: false as const, reason: "already_used" as const, ticket };
    }
    store.tickets[idx] = {
      ...ticket,
      status: "used",
      used_at: new Date().toISOString(),
    };
    await writeStore(store);
    return { ok: true as const, ticket: store.tickets[idx] };
  },
};
