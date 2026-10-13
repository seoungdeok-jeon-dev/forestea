# Forestea

Forest-themed café website — monorepo with **web**, **api**, and **db**. Menu is managed in-app; payments use **Stripe**.

## Structure

```
forestea/
├── apps/
│   ├── api/     # Fastify REST API (Stripe + Prisma)
│   └── web/     # Next.js storefront
├── packages/
│   ├── menu/    # Shared drink catalog + pricing
│   ├── clover/  # Legacy Clover client (optional)
│   └── db/      # Prisma + PostgreSQL
└── docker-compose.yml
```

## Quick start

### 1. Database

```bash
docker compose up -d
# Local secrets (gitignored):
#   apps/api/.env.local
#   apps/web/.env.local
# Production values live only on Railway / Vercel dashboards.
# See apps/api/.env.production and apps/web/.env.production for key checklists.
```

### 2. Install & migrate

```bash
pnpm install
pnpm db:generate
pnpm db:push
```

### 3. Stripe keys

In [Stripe Dashboard → Developers → API keys](https://dashboard.stripe.com/test/apikeys), copy the **test** keys into `apps/api/.env.local`:

```bash
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
TAX_RATE="0.101"
```

Restart the API after changing keys. Card testing: `4242 4242 4242 4242`, any future expiry, any CVC.

### 4. Run dev servers

```bash
pnpm dev
```

- Web: http://localhost:3000 (scroll story) · http://localhost:3000/menu  
- API: http://localhost:4000  

## Legacy Clover (optional)

Clover OAuth routes remain for older tooling, but the storefront menu and checkout no longer use Clover.

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
