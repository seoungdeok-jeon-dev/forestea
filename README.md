# Forestea

Forest-themed café website — monorepo with **web**, **api**, and **db**, integrated with **Clover** for menu sync, orders, and payments.

## Structure

```
forestea/
├── apps/
│   ├── api/     # Fastify REST API (Clover + Prisma)
│   └── web/     # Next.js storefront
├── packages/
│   ├── clover/  # Clover Platform & Ecommerce client
│   └── db/      # Prisma + PostgreSQL
└── docker-compose.yml
```

## Quick start

### 1. Database

```bash
docker compose up -d
cp apps/api/.env.example apps/api/.env    # DATABASE_URL + Clover
cp apps/web/.env.example apps/web/.env.local   # NEXT_PUBLIC_*
```

### 2. Install & migrate

```bash
pnpm install
pnpm db:generate
pnpm db:push
```

### 3. Run dev servers

```bash
pnpm dev
```

- Web: http://localhost:3000 (scroll story) · http://localhost:3000/menu  
- API: http://localhost:4000  

## Clover OAuth v2 (recommended)

Dynamic tokens (`access_token`, `refresh_token`) are stored in PostgreSQL (`clover_auth` table), **not** in `.env`.

| Variable | Description |
|----------|-------------|
| `CLOVER_APP_ID` | Clover app ID (client_id) |
| `CLOVER_APP_SECRET` | App secret (server only) |
| `CLOVER_REDIRECT_URI` | `http://localhost:4000/auth` (백엔드 OAuth 콜백) |
| `CLOVER_MERCHANT_ID` | Your store merchant id |
| `CLOVER_SANDBOX` | `true` for sandbox (default) |
| `CLOVER_ECOMMERCE_API_KEY` | Ecommerce public token (PAKMS) — optional fallback; OAuth `/pakms/apikey` is preferred |

1. Set `apps/api/.env` with the values above.
2. Register the same redirect URI in Clover Developer.
3. Open http://localhost:3000/admin/setting → **Clover 계정 연동하기**.
4. After redirect, tokens are saved and refreshed automatically before API calls.

## Demo mode

Without `CLOVER_APP_ID` / `CLOVER_APP_SECRET`, or before OAuth completes, the API uses mock menu and payments.

### Clover sandbox test card (Hosted iFrame)

Enter in the checkout iframe fields (card data never touches Forestea servers):

- Number: `6011361000006668`
- Exp: `12/30`, CVV: `123`, ZIP: any valid US ZIP

## Production payments (PCI)

1. Enable **Hosted iFrame** on your Clover app (Developer dashboard → Ecommerce).
2. Complete OAuth on production (`CLOVER_SANDBOX=false`, production app credentials, HTTPS `CLOVER_REDIRECT_URI`).
3. Checkout loads `checkout.clover.com/sdk.js` (sandbox: `checkout.sandbox.dev.clover.com/sdk.js`).
4. Browser calls `clover.createToken()` → `clv_…` token only is sent to `POST /orders`.
5. API resolves prices from Clover menu, creates atomic order + charge with `idempotency-key`.

## API endpoints (port 4000, no `/api` prefix)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Server & Clover connection status |
| GET | `/menu` | Categories & items from Clover |
| GET | `/menu/items/:itemId` | Item detail with modifier groups |
| POST | `/checkout` | Calculate tax/total (atomic checkout) |
| POST | `/orders` | Pay with `sourceToken` (`clv_…`) + `idempotencyKey` (UUID) |
| GET | `/orders/:id` | Order status from DB |
| GET | `/payments/config` | iFrame SDK URL, PAKMS public key, `merchantId` |
| GET | `/auth` | OAuth callback (Clover redirect) |
| GET | `/auth/connect-url` | Start OAuth URL |
| GET | `/auth/status` | Connection status for merchant |

## Clover flow

1. **Menu** — Platform API `GET /v3/merchants/{mId}/items`
2. **Checkout** — `POST atomic_order/checkouts` for totals (server-side menu prices)
3. **Tokenize (browser)** — Hosted iFrame `clover.createToken()` → `clv_…` (PAKMS public key from `GET /payments/config`)
4. **Order** — `POST atomic_order/orders` + Ecommerce `POST /v1/charges` with OAuth Bearer + idempotency header

Orders are persisted in PostgreSQL via Prisma for confirmation pages and history.
