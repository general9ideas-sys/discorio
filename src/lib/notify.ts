import QRCode from "qrcode";
import { siteUrl } from "./env";

export async function ticketQrDataUrl(code: string) {
  const payload = `${siteUrl()}/entrada/${code}`;
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 280,
    color: { dark: "#102028", light: "#ffffff" },
  });
}

export async function sendTicketEmail(opts: {
  to: string;
  buyerName: string;
  orderId: string;
  eventName: string;
}) {
  const link = `${siteUrl()}/orden/${opts.orderId}`;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[email-demo] Entradas para ${opts.to}: ${link}`);
    return { sent: false as const, link };
  }

  const from = process.env.EMAIL_FROM || "entradas@discoriofiesta.com";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: opts.to,
      subject: `Tus entradas — ${opts.eventName}`,
      html: `<p>Hola ${opts.buyerName},</p>
        <p>Tu compra para <strong>${opts.eventName}</strong> está confirmada.</p>
        <p><a href="${link}">Abrí tus QR acá</a></p>
        <p>Disco Río Fiesta</p>`,
    }),
  });

  if (!res.ok) {
    console.error("Resend error", await res.text());
    return { sent: false as const, link };
  }
  return { sent: true as const, link };
}
