# Forestea Quick Reference

## 🚀 Start Development (Most Common)

```bash
# Terminal 1: API
cd apps/api
pnpm dev

# Terminal 2: Web
cd apps/web
pnpm dev

# Open browser: http://localhost:3000
```

---

## 🌍 Environments

| Environment | Web URL | API URL | Database | Clover |
|-------------|---------|---------|----------|--------|
| **Development** | localhost:3000 | localhost:4000 | `forestea_development` | Sandbox (X5JX1NZNZ4BQ1) |
| **Production** | foresteacafe.com | api.foresteacafe.com | `forestea_production` | Production (M9MMNPP2ERA71) |

---

## 📦 Commands

### API (`apps/api`)
```bash
pnpm dev          # Development server (hot reload)
pnpm build        # Compile TypeScript → dist/
pnpm start        # Run compiled code (requires build first!)
```

**Important:** `pnpm start` needs `pnpm build` first, or it will fail!

### Web (`apps/web`)
```bash
pnpm dev          # Development server (hot reload)
pnpm build        # Build optimized bundle → .next/
pnpm start        # Run production server (requires build first!)
```

**Important:** `pnpm start` needs `pnpm build` first, or it will fail!

### Database (`packages/db`)
```bash
pnpm prisma generate              # Generate client
pnpm prisma db push              # Apply schema
pnpm prisma studio               # Open GUI
```

---

## 🗄️ Database

### Create Databases
```bash
./setup-databases.sh
```

### Check Database
```bash
# Development
psql postgresql://forestea:forestea@localhost:5432/forestea_development

# Production
psql postgresql://forestea:forestea@localhost:5432/forestea_production

# Commands inside psql:
\dt                           # List tables
\d clover_auth               # Table structure
SELECT * FROM clover_auth;   # View data
\q                           # Exit
```

---

## 🔧 Environment Files

### API: `apps/api/.env.development`
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

### API: `apps/api/.env.production`
```bash
DATABASE_URL="postgresql://forestea:forestea@localhost:5432/forestea_production"
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

### Web: `apps/web/.env.local`
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

### Web: `apps/web/.env.production`
```bash
DATABASE_URL="postgresql://user:pass@cloud-host:5432/forestea_production"
NEXT_PUBLIC_API_URL="https://api.foresteacafe.com"
AUTH_SECRET="gK6m15G9vx8NAoruhvUApmfIRphOtKsBa+sHmW61300="
AUTH_URL="https://foresteacafe.com"
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
ADMIN_EMAILS="cjhj1025@gmail.com,seoungdeok.jeon.dev@gmail.com"
INTERNAL_API_SECRET="83df2919b4d58ebdafe21374235a032f94ddf2c38706006af5f3dba39963bed8"
```

---

## 🧪 Local Production Testing vs Real Deployment

### Local Production Mode (Still on your computer)
```bash
# API
cd apps/api
pnpm build
NODE_ENV=production pnpm start
# → localhost:4000 (only you can access)

# Web
cd apps/web
pnpm build
pnpm start
# → localhost:3000 (only you can access)
```

❌ **foresteacafe.com is NOT accessible** (still running on your computer)

### Real Deployment (Accessible to everyone)
```bash
# Deploy to cloud (Railway/Vercel)
# Cloud automatically runs: pnpm install → pnpm build → pnpm start
# DNS: foresteacafe.com → Cloud server
```

✅ **https://foresteacafe.com is accessible worldwide**

| Command | Location | URL | Who can access? |
|---------|----------|-----|-----------------|
| `pnpm dev` | Your computer | localhost:3000 | Only you |
| `pnpm build && pnpm start` | Your computer | localhost:3000 | Only you |
| **Deploy to cloud** | Cloud server | foresteacafe.com | Everyone |

---

## 🔗 Useful URLs

### Development
- Web: http://localhost:3000
- Admin: http://localhost:3000/admin/setting
- API Health: http://localhost:4000/health

### Production
- Web: https://foresteacafe.com
- Admin: https://foresteacafe.com/admin/setting
- API Health: https://api.foresteacafe.com/health

### Clover
- Sandbox: https://sandbox.dev.clover.com
- Production: https://www.clover.com
- Developer: https://www.clover.com/developer-home/apps

---

## 🐛 Common Issues

### Database doesn't exist
```bash
./setup-databases.sh
```

### API not responding
```bash
cd apps/api && pnpm dev
```

### Module not found
```bash
pnpm install
```

### OAuth failed
- Check `CLOVER_REDIRECT_URI` matches Clover settings exactly
- Verify `CLOVER_APP_SECRET` is correct
- Ensure using correct environment (sandbox vs production)

---

## 📚 Full Documentation

See [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) for complete details.
