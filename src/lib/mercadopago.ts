import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { isDemoMode, siteUrl } from "./env";
import type { EventRow, OrderRow } from "./types";

export function hasMercadoPago() {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN) && !isDemoMode();
}

function client() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN no configurado");
  return new MercadoPagoConfig({ accessToken: token });
}

export async function createCheckoutPreference(order: OrderRow, event: EventRow) {
  if (!hasMercadoPago()) {
    return {
      id: `demo-pref-${order.id}`,
      init_point: `${siteUrl()}/api/checkout/demo-pay?orderId=${order.id}`,
    };
  }

  const preference = new Preference(client());
  const result = await preference.create({
    body: {
      items: [
        {
          id: event.id,
          title: `${event.name} — entrada`,
          quantity: order.quantity,
          unit_price: event.price,
          currency_id: "ARS",
        },
      ],
      payer: {
        name: order.buyer_name,
        email: order.buyer_email,
      },
      external_reference: order.id,
      notification_url: `${siteUrl()}/api/webhooks/mercadopago`,
      back_urls: {
        success: `${siteUrl()}/orden/${order.id}?status=success`,
        pending: `${siteUrl()}/orden/${order.id}?status=pending`,
        failure: `${siteUrl()}/entradas?status=failure`,
      },
      auto_return: "approved",
      metadata: {
        order_id: order.id,
        event_id: event.id,
      },
    },
  });

  return {
    id: String(result.id),
    init_point: result.init_point || result.sandbox_init_point || "",
  };
}

export async function getPayment(paymentId: string) {
  const payment = new Payment(client());
  return payment.get({ id: paymentId });
}
