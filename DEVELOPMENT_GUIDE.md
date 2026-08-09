# Forestea Development Guide

Complete guide for running, developing, and deploying the Forestea application.

---

## 📁 Project Structure

```
forestea/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Fastify API server
└── packages/
    ├── db/           # Prisma schema & client
    └── clover/       # Clover API integration
```

---

## 🌍 Environments

### Development (Local)
- **Purpose**: Local development and testing
- **Web**: http://localhost:3000
- **API**: http://localhost:4000
- **Database**: `forestea_development` (local PostgreSQL)
- **Clover**: Sandbox environment (test data)

### Production (Deployed)
- **Purpose**: Live application for customers
- **Web**: https://foresteacafe.com
- **API**: https://api.foresteacafe.com
- **Database**: `forestea_production` (cloud PostgreSQL)
- **Clover**: Production environment (real POS data)

---

## 🗄️ Database Setup

### Prerequisites
- PostgreSQL installed and running
- User `forestea` with password `forestea`

### Create Databases

**Option 1: Automated Setup (Recommended)**
```bash
# From project root
./setup-databases.sh
```

**Option 2: Manual Setup**
```bash
# Connect to PostgreSQL
psql postgresql://forestea:forestea@localhost:5432/postgres

# Create databases
CREATE DATABASE forestea_development;
CREATE DATABASE forestea_production;

# Exit psql
\q

# Apply schema to development
cd packages/db
DATABASE_URL="postgresql://forestea:forestea@localhost:5432/forestea_development" npx prisma db push

# Apply schema to production
DATABASE_URL="postgresql://forestea:forestea@localhost:5432/forestea_production" npx prisma db push
```

### Check Databases

**List all databases:**
```bash
psql postgresql://forestea:forestea@localhost:5432/postgres -c "\l"
```

**Check development database:**
```bash
psql postgresql://forestea:forestea@localhost:5432/forestea_development

# Inside psql:
\dt              # List all tables
\d clover_auth   # Show clover_auth table structure
\d users         # Show users table structure
SELECT * FROM clover_auth;  # View Clover tokens
\q               # Exit
```

**Check production database:**
```bash
psql postgresql://forestea:forestea@localhost:5432/forestea_production

# Same commands as above
```

---

## 🚀 Running Locally (Development)

### 1. Install Dependencies

```bash
# From project root
pnpm install
```

### 2. Setup Environment Files

**API: `apps/api/.env.development`**
```bash
DATABASE_URL="postgresql://forestea:forestea@localhost:5432/forestea_development"
PORT=4000
WEB_ORIGIN="http://localhost:3000"

CLOVER_APP_ID="57J8VGX6JDM3E"
CLOVER_APP_SECRET="8f711d1f-f18b-bf41-98d6-6e4779c23f8c"
CLOVER_REDIRECT_URI="http://localhost:4000/auth"
CLOVER_MERCHANT_ID="X5JX1NZNZ4BQ1"
CLOVER_SANDBOX="true"

CLOVER_ECOMMERCE_API_KEY="dacd40737920f6a9e75382b18bd71df0"
INTERNAL_API_SECRET="83df2919b4d58ebdafe21374235a032f94ddf2c38706006af5f3dba39963bed8"
```

**Web: `apps/web/.env.local`**
```bash
DATABASE_URL="postgresql://forestea:forestea@localhost:5432/forestea_development"
NEXT_PUBLIC_API_URL="http://localhost:4000"

AUTH_SECRET="gK6m15G9vx8NAoruhvUApmfIRphOtKsBa+sHmW61300="
AUTH_URL="http://localhost:3000"

AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""

ADMIN_EMAILS="cjhj1025@gmail.com,seoungdeok.jeon.dev@gmail.com"
INTERNAL_API_SECRET="83df2919b4d58ebdafe21374235a032f94ddf2c38706006af5f3dba39963bed8"
```

### 3. Start Servers

**Terminal 1: API Server**
```bash
cd apps/api
pnpm dev
```
✅ Runs on http://localhost:4000

**Terminal 2: Web Server**
```bash
cd apps/web
pnpm dev
```
✅ Runs on http://localhost:3000

### 4. Access Application

- **Web**: http://localhost:3000
- **Admin Settings**: http://localhost:3000/admin/setting
- **API Health**: http://localhost:4000/health

### 5. Connect Clover Sandbox

1. Go to http://localhost:3000/admin/setting
2. Click "Connect Clover Account"
3. Log in with Sandbox merchant credentials
4. Approve permissions
5. Redirected back with success message

---

## 🧪 Testing Production Build Locally (Optional)

You can test the production build on your local machine before deploying. This is useful for:
- Testing build process
- Checking production performance
- Debugging production-only issues

**Important:** This still runs on localhost, NOT on foresteacafe.com!

### Build and Run Locally

**API:**
```bash
cd apps/api
pnpm build                    # Compile TypeScript → JavaScript
NODE_ENV=production pnpm start # Run compiled code
```
✅ Runs on http://localhost:4000 (still local!)

**Web:**
```bash
cd apps/web
pnpm build                    # Build optimized production bundle
pnpm start                    # Run production server
```
✅ Runs on http://localhost:3000 (still local!)

**Access:** http://localhost:3000
- Uses `.env.production` settings
- Connects to `forestea_production` database
- ❌ foresteacafe.com is NOT accessible (you're still on localhost)

### Local vs Cloud Deployment

| Action | Where it runs | URL Access |
|--------|---------------|------------|
| `pnpm dev` | Your computer | http://localhost:3000 |
| `pnpm build && pnpm start` | Your computer | http://localhost:3000 |
| **Real deployment** | Cloud server (Railway/Vercel) | https://foresteacafe.com |

To make foresteacafe.com work, you MUST deploy to cloud servers (see next section).

---

## 📦 Production Deployment (Real Deployment)

### Deployment Flow

```
┌─────────────────────────────────────────────────────────┐
│ Local Development (Your Computer)                       │
├─────────────────────────────────────────────────────────┤
│ pnpm dev                                                │
│ → localhost:3000 (only you can access)                 │
└─────────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Build Locally (Optional Testing)                        │
├─────────────────────────────────────────────────────────┤
│ pnpm build && pnpm start                                │
│ → localhost:3000 (still only you)                      │
└─────────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Deploy to Cloud (Railway/Vercel)                        │
├─────────────────────────────────────────────────────────┤
│ 1. Upload code                                          │
│ 2. Cloud runs: pnpm install                            │
│ 3. Cloud runs: pnpm build                              │
│ 4. Cloud runs: pnpm start                              │
│ 5. DNS: foresteacafe.com → Cloud server IP                 │
└─────────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Production (Live)                                       │
├─────────────────────────────────────────────────────────┤
│ ✅ https://foresteacafe.com                                 │
│ ✅ Accessible to everyone worldwide                     │
└─────────────────────────────────────────────────────────┘
```

### Prerequisites

- **Domain**: foresteacafe.com (purchased on Cloudflare)
- **Cloud Database**: PostgreSQL instance (Railway, Supabase, AWS RDS)
- **Hosting**: Web (Vercel) + API (Railway/AWS)

### 1. Setup Production Database

**Create cloud PostgreSQL database with:**
- Database name: `forestea_production`
- Note the connection string

**Apply schema:**
```bash
cd packages/db
DATABASE_URL="your-cloud-database-url" npx prisma db push
```

### 2. Configure Environment Variables

**API: `apps/api/.env.production`**
```bash
DATABASE_URL="postgresql://user:password@cloud-host:5432/forestea_production"
PORT=4000
WEB_ORIGIN="https://foresteacafe.com"

CLOVER_APP_ID="8ZWHJD40P649C"
CLOVER_APP_SECRET="9a773e61-6316-a894-8402-ca564781c68f"
CLOVER_REDIRECT_URI="https://api.foresteacafe.com/auth"
CLOVER_MERCHANT_ID="M9MMNPP2ERA71"
CLOVER_SANDBOX="false"

CLOVER_ECOMMERCE_API_KEY=""
INTERNAL_API_SECRET="83df2919b4d58ebdafe21374235a032f94ddf2c38706006af5f3dba39963bed8"
```

**Web: `apps/web/.env.production`**
```bash
DATABASE_URL="postgresql://user:password@cloud-host:5432/forestea_production"
NEXT_PUBLIC_API_URL="https://api.foresteacafe.com"

AUTH_SECRET="gK6m15G9vx8NAoruhvUApmfIRphOtKsBa+sHmW61300="
AUTH_URL="https://foresteacafe.com"

AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""

ADMIN_EMAILS="cjhj1025@gmail.com,seoungdeok.jeon.dev@gmail.com"
INTERNAL_API_SECRET="83df2919b4d58ebdafe21374235a032f94ddf2c38706006af5f3dba39963bed8"
```

### 3. Deploy API Server

**What happens during deployment:**
1. Upload code to cloud server
2. Cloud server runs `pnpm install`
3. Cloud server runs `pnpm build`
4. Cloud server runs `pnpm start`
5. Server is accessible at `api.foresteacafe.com`

**Option A: Railway (Recommended)**
```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login and initialize
railway login
railway init

# 3. Link to project
railway link

# 4. Add environment variables
# Go to Railway dashboard → Variables
# Add all variables from .env.production

# 5. Deploy
cd apps/api
railway up

# Railway automatically runs:
# - pnpm install
# - pnpm build
# - pnpm start (via package.json start script)
```

✅ API is now live at: `https://your-app.railway.app`

**Option B: Manual Server (AWS/DigitalOcean)**
```bash
# 1. SSH into your server
ssh user@your-server-ip

# 2. Clone repository
git clone https://github.com/your-repo/forestea.git
cd forestea/apps/api

# 3. Install dependencies
pnpm install

# 4. Build
pnpm build

# 5. Run with PM2
NODE_ENV=production pm2 start dist/index.js --name forestea-api

# 6. Setup nginx reverse proxy to serve on port 80/443
```

### 4. Deploy Web App

**What happens during deployment:**
1. Upload code to Vercel
2. Vercel runs `pnpm install`
3. Vercel runs `pnpm build`
4. Vercel deploys to global CDN
5. Website is accessible at `foresteacafe.com`

**Vercel (Recommended for Next.js)**
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
cd apps/web
vercel

# 3. Follow prompts:
# - Link to Vercel project (or create new)
# - Framework: Next.js (auto-detected)
# - Build command: pnpm build (auto-configured)

# 4. Add environment variables
# Go to Vercel dashboard → Settings → Environment Variables
# Add all variables from .env.production

# 5. Redeploy with production env
vercel --prod

# Vercel automatically runs:
# - pnpm install
# - pnpm build (creates .next/ folder)
# - Deploys optimized static + server files
```

✅ Web is now live at: `https://forestea.vercel.app` (then connect custom domain)

### 5. Configure DNS (Cloudflare)

```
Type    Name    Target
────────────────────────────────────────
A       @       Vercel IP (or CNAME)
CNAME   www     foresteacafe.com
CNAME   api     railway.app (or your server)
```

### 6. Update Clover App Settings

1. Go to https://www.clover.com/developer-home/apps
2. Select "Forestea Integration App"
3. Edit **REST Configuration**:
   - Site URL: `https://api.foresteacafe.com/auth`
   - CORS Domain: `https://foresteacafe.com`
4. Save

### 7. Submit Clover App

1. Click **"Submit App"** button
2. Select **Private App** (not publicly available)
3. Wait for approval (1-3 business days)

### 8. Connect Production Clover

After app is approved:
1. Go to https://foresteacafe.com/admin/setting
2. Click "Connect Clover Account"
3. Log in with real merchant account (cjhj1025@gmail.com)
4. Approve permissions
5. ✅ Production is live!

---

## 🔧 Common Commands

### API Server

```bash
cd apps/api

# Development (hot reload, TypeScript directly)
pnpm dev          # Runs with tsx watch - for local development

# Production Build & Run (must build first!)
pnpm build        # Compiles TypeScript → JavaScript in dist/
pnpm start        # Runs compiled code (requires build first)

# Type checking
pnpm lint         # Check TypeScript errors without building
```

**Important:** `pnpm start` requires `pnpm build` first. Otherwise you'll get:
```
Error: Cannot find module '/path/to/dist/index.js'
```

### Web App

```bash
cd apps/web

# Development (hot reload, fast refresh)
pnpm dev          # Runs Next.js dev server - for local development

# Production Build & Run (must build first!)
pnpm build        # Builds optimized production bundle in .next/
pnpm start        # Runs production server (requires build first)

# Linting
pnpm lint         # Check code quality
```

**Important:** `pnpm start` requires `pnpm build` first. Otherwise you'll get:
```
Error: Could not find a production build in the '.next' directory
```

### Database

```bash
cd packages/db

# Generate Prisma client
pnpm prisma generate

# Apply schema changes
DATABASE_URL="..." pnpm prisma db push

# Open Prisma Studio (GUI)
DATABASE_URL="..." pnpm prisma studio

# Create migration
DATABASE_URL="..." pnpm prisma migrate dev --name migration_name
```

---

## 🐛 Troubleshooting

### "Database does not exist"
```bash
# Create the database first
./setup-databases.sh
```

### "Connection refused to localhost:4000"
```bash
# Make sure API server is running
cd apps/api && pnpm dev
```

### "Clover OAuth failed"
```bash
# Check that CLOVER_REDIRECT_URI matches Clover Developer settings exactly
# Check that APP_SECRET is correct
# Make sure you're using the right environment (sandbox vs production)
```

### "Cannot find module '@forestea/db'"
```bash
# Install dependencies from project root
pnpm install
```

### "Access token expired"
- Tokens are automatically refreshed
- If persistent issues, disconnect and reconnect at /admin/setting

---

## 📝 Environment Variables Reference

### Required for Both Environments

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `PORT` | API server port | `4000` |
| `WEB_ORIGIN` | Web app URL (for CORS) | `http://localhost:3000` |
| `CLOVER_APP_ID` | Clover app ID | `57J8VGX6JDM3E` |
| `CLOVER_APP_SECRET` | Clover app secret | `8f711d1f-...` |
| `CLOVER_REDIRECT_URI` | OAuth callback URL | `http://localhost:4000/auth` |
| `CLOVER_MERCHANT_ID` | Merchant ID | `X5JX1NZNZ4BQ1` |
| `CLOVER_SANDBOX` | Sandbox flag | `true` or `false` |
| `INTERNAL_API_SECRET` | Server-to-server auth | 32+ char random string |

### Optional

| Variable | Description |
|----------|-------------|
| `CLOVER_ECOMMERCE_API_KEY` | PAKMS key (auto-fetched via OAuth) |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth secret |

---

## 🔐 Security Notes

- **Never commit** `.env.development`, `.env.production`, `.env.local` to git
- `.gitignore` already excludes these files
- Use deployment platform's secret store for production
- Rotate `INTERNAL_API_SECRET` if compromised
- Keep `CLOVER_APP_SECRET` secure

---

## 📚 Additional Resources

- [Clover Documentation](https://docs.clover.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Fastify Documentation](https://www.fastify.io)

---

## ✅ Quick Start Checklist

- [ ] PostgreSQL installed and running
- [ ] Databases created (`./setup-databases.sh`)
- [ ] Dependencies installed (`pnpm install`)
- [ ] Environment files configured
- [ ] API server running (`cd apps/api && pnpm dev`)
- [ ] Web server running (`cd apps/web && pnpm dev`)
- [ ] Clover connected at http://localhost:3000/admin/setting
- [ ] Test menu loading and checkout flow

**Happy developing!** 🎉
