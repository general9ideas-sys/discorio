export type EventRow = {
  id: string;
  slug: string;
  name: string;
  date_iso: string;
  venue: string;
  price: number;
  capacity: number;
  active: boolean;
};

export type OrderStatus = "pending" | "paid" | "failed";
export type TicketStatus = "valid" | "used";

export type OrderRow = {
  id: string;
  event_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  quantity: number;
  total: number;
  status: OrderStatus;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  created_at: string;
  paid_at: string | null;
};

export type TicketRow = {
  id: string;
  order_id: string;
  event_id: string;
  code: string;
  status: TicketStatus;
  used_at: string | null;
  created_at: string;
};
