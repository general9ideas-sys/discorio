# Disco Río — Ticketera propia

## Desarrollo

```bash
npm install
npm run dev
```

Abrí http://localhost:3000

- Comprar: `/entradas`
- Scanner puerta: `/admin/scan` (PIN default `discorio2026`)
- Ventas: `/admin`

Con `DEMO_MODE=true` el pago simula Mercado Pago y guarda en `data/store.json`.

## Producción

1. Crear proyecto Supabase y correr `supabase/schema.sql`
2. Crear app Mercado Pago y copiar Access Token
3. Completar `.env` (ver `.env.example`)
4. Setear `DEMO_MODE=false`
5. Deploy en Vercel

Variables clave:

- `NEXT_PUBLIC_SITE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` / `NEXT_PUBLIC_SUPABASE_URL`
- `MERCADOPAGO_ACCESS_TOKEN`
- `ADMIN_PIN`
- `RESEND_API_KEY` (opcional, email de entradas)
