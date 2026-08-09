# Forestea Production Deployment - Step by Step Guide

Complete guide for deploying Forestea to production using Neon (Database), Railway (API), and Vercel (Web).

---

## 📋 Overview

```
┌─────────────────────────────────────────────────────────┐
│ Production Architecture                                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  User Browser                                           │
│       ↓                                                 │
│  foresteacafe.com (Vercel)                                  │
│       ↓                                                 │
│  api.foresteacafe.com (Railway)                             │
│       ↓                                                 │
│  PostgreSQL (Neon)                                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Step 1: Setup Database (Neon)

### 1.1 Create Neon Account

1. Go to https://neon.tech
2. Click **"Sign Up"**
3. Sign up with:
   - GitHub (recommended)
   - Google
   - Email

### 1.2 Create Project

1. After login, click **"New Project"**
2. Fill in project details:
   - **Project name**: `forestea-production`
   - **Region**: Select closest to your users
     - US East (Ohio) - for US
     - Europe (Frankfurt) - for Europe
     - Asia Pacific (Singapore) - for Asia
   - **PostgreSQL version**: 16 (latest)
3. Click **"Create Project"**

⏳ Wait ~30 seconds for project creation

### 1.3 Get Connection String

1. On project dashboard, you'll see **"Connection Details"**
2. Copy the connection string:
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. **Important:** This is your `DATABASE_URL` - save it!

### 1.4 Create Database

1. Click on **"SQL Editor"** in left sidebar
2. Run this SQL:
   ```sql
   CREATE DATABASE forestea_production;
   ```
3. Click **"Run"**

✅ Database created!

### 1.5 Update Connection String

Change the connection string to use the new database:
```
Original: postgresql://user:pass@host/neondb?sslmode=require
Updated:  postgresql://user:pass@host/forestea_production?sslmode=require
```

Save this updated connection string!

### 1.6 Apply Schema

On your local machine:
```bash
cd packages/db

# Use the Neon connection string
DATABASE_URL="postgresql://user:pass@host/forestea_production?sslmode=require" npx prisma db push

# You should see:
# ✓ Created table: clover_auth
# ✓ Created table: users
# ✓ Created table: orders
# etc...
```

✅ **Neon Setup Complete!**

**Save this for later:**
- Connection String: `postgresql://...`

---

## 🚂 Step 2: Deploy API Server (Railway)

### 2.1 Create Railway Account

1. Go to https://railway.app
2. Click **"Login"**
3. Login with **GitHub** (recommended for easy deployments)
4. Authorize Railway to access your GitHub

### 2.2 Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. If your repo is private:
   - Click **"Configure GitHub App"**
   - Grant Railway access to the repository
4. Select your `forestea` repository
5. Railway will detect it's a monorepo

### 2.3 Configure Build Settings

1. Click on the deployed service
2. Go to **"Settings"** tab
3. Configure:
   - **Root Directory**: `apps/api`
   - **Build Command**: `cd ../.. && pnpm install && cd apps/api && pnpm build`
   - **Start Command**: `pnpm start`
   - **Watch Paths**: `apps/api/**`

### 2.4 Add Environment Variables

1. Go to **"Variables"** tab
2. Click **"New Variable"**
3. Add each variable:

```bash
# Database (from Neon)
DATABASE_URL=postgresql://user:pass@neon-host/forestea_production?sslmode=require

# Server
PORT=4000
NODE_ENV=production
WEB_ORIGIN=https://foresteacafe.com

# Clover Production
CLOVER_APP_ID=8ZWHJD40P649C
CLOVER_APP_SECRET=9a773e61-6316-a894-8402-ca564781c68f
CLOVER_REDIRECT_URI=https://api.foresteacafe.com/auth
CLOVER_MERCHANT_ID=M9MMNPP2ERA71
CLOVER_SANDBOX=false

# Optional
CLOVER_ECOMMERCE_API_KEY=

# Security
INTERNAL_API_SECRET=83df2919b4d58ebdafe21374235a032f94ddf2c38706006af5f3dba39963bed8
```

**Important:** Add each variable one by one using the UI.

### 2.5 Deploy

1. Railway automatically deploys when you add variables
2. Watch the **"Deployments"** tab for build logs
3. Wait for **"Success"** status (~2-3 minutes)

### 2.6 Get Railway URL

1. Go to **"Settings"** tab
2. Scroll to **"Domains"**
3. Click **"Generate Domain"**
4. You'll get: `your-app.railway.app`
5. **Test it:** Open `https://your-app.railway.app/health`

You should see:
```json
{"ok": true, "message": "Forestea API is running"}
```

✅ **Railway API is live!**

### 2.7 Add Custom Domain (Later)

1. In **"Domains"** section, click **"Custom Domain"**
2. Enter: `api.foresteacafe.com`
3. Railway will show DNS records to add:
   ```
   Type: CNAME
   Name: api
   Value: your-app.railway.app
   ```
4. Add these to Cloudflare (we'll do this in Step 4)

**Save this for later:**
- Railway URL: `https://your-app.railway.app`
- Custom domain target: `your-app.railway.app`

---

## 🚀 Step 3: Deploy Web App (Vercel)

### 3.1 Create Vercel Account

1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Sign up with **GitHub** (recommended)
4. Authorize Vercel to access GitHub

### 3.2 Import Project

1. Click **"Add New..."** → **"Project"**
2. Find your `forestea` repository
3. Click **"Import"**

### 3.3 Configure Build Settings

Vercel auto-detects Next.js, but verify:

1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `apps/web`
3. **Build Command**: `cd ../.. && pnpm install && cd apps/web && pnpm build`
4. **Output Directory**: `.next` (auto-configured)
5. **Install Command**: `pnpm install`

### 3.4 Add Environment Variables

1. Scroll to **"Environment Variables"** section
2. Add each variable:

**Select environment:** ✓ Production ✓ Preview ✓ Development

```bash
# Database (from Neon)
DATABASE_URL=postgresql://user:pass@neon-host/forestea_production?sslmode=require

# API Connection
NEXT_PUBLIC_API_URL=https://api.foresteacafe.com

# Auth.js
AUTH_SECRET=gK6m15G9vx8NAoruhvUApmfIRphOtKsBa+sHmW61300=
AUTH_URL=https://foresteacafe.com

# Google OAuth (optional)
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# Admin
ADMIN_EMAILS=cjhj1025@gmail.com,seoungdeok.jeon.dev@gmail.com

# Security
INTERNAL_API_SECRET=83df2919b4d58ebdafe21374235a032f94ddf2c38706006af5f3dba39963bed8
```

### 3.5 Deploy

1. Click **"Deploy"**
2. Vercel builds and deploys (~2-3 minutes)
3. Watch build logs in real-time
4. Wait for **"Congratulations"** message

### 3.6 Get Vercel URL

1. After deployment, you'll see: `https://forestea-xxx.vercel.app`
2. **Test it:** Open the URL in browser
3. You should see your Forestea website!

✅ **Vercel Web is live!**

### 3.7 Add Custom Domain

1. Go to **"Settings"** → **"Domains"**
2. Click **"Add"**
3. Enter: `foresteacafe.com`
4. Click **"Add"**
5. Vercel will show DNS records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
6. Add these to Cloudflare (next step)

**Save this for later:**
- Vercel URL: `https://forestea-xxx.vercel.app`
- DNS records for Cloudflare

---

## 🌐 Step 4: Configure DNS (Cloudflare)

### 4.1 Login to Cloudflare

1. Go to https://dash.cloudflare.com
2. Login with your account
3. Select your **foresteacafe.com** domain

### 4.2 Add DNS Records

Click **"DNS"** → **"Records"** → **"Add record"**

#### Record 1: Web App (Vercel)
```
Type: A
Name: @
IPv4 address: 76.76.21.21
Proxy status: ✓ Proxied (orange cloud)
TTL: Auto
```

#### Record 2: WWW Redirect (Vercel)
```
Type: CNAME
Name: www
Target: cname.vercel-dns.com
Proxy status: ✓ Proxied
TTL: Auto
```

#### Record 3: API Server (Railway)
```
Type: CNAME
Name: api
Target: your-app.railway.app
Proxy status: ✓ Proxied
TTL: Auto
```

### 4.3 SSL/TLS Settings

1. Go to **"SSL/TLS"** tab
2. Set encryption mode: **"Full (strict)"**
3. Enable **"Always Use HTTPS"**

### 4.4 Verify DNS Propagation

Wait 5-10 minutes, then test:

```bash
# Check DNS
nslookup foresteacafe.com
nslookup api.foresteacafe.com

# Test HTTPS
curl https://foresteacafe.com
curl https://api.foresteacafe.com/health
```

✅ **DNS Configured!**

---

## 🔧 Step 5: Update Clover App Settings

### 5.1 Login to Clover Developer

1. Go to https://www.clover.com/developer-home/apps
2. Login with your developer account (seoungdeok.jeon.dev@gmail.com)
3. Select **"Forestea Integration App"**

### 5.2 Update REST Configuration

1. Click **"App Settings"**
2. Scroll to **"REST Configuration"**
3. Click edit icon
4. Update:
   - **Site URL**: `https://api.foresteacafe.com/auth`
   - **CORS Domain**: `https://foresteacafe.com`
   - **Default OAuth Response**: `CODE`
5. Click **"Save"**

### 5.3 Verify Permissions

Check **"Requested Permissions"**:
- ✓ Read and Write: Orders, Payments
- ✓ Read: Inventory
- ✓ Ecommerce

### 5.4 Verify Ecommerce Settings

Check **"Ecommerce Settings"**:
- ✓ Integrations Enabled: **Hosted iFrame**

---

## 📤 Step 6: Submit Clover App

### 6.1 Review App Settings

Double-check everything:
- ✅ Site URL: `https://api.foresteacafe.com/auth`
- ✅ CORS Domain: `https://foresteacafe.com`
- ✅ Permissions configured
- ✅ Ecommerce: Hosted iFrame

### 6.2 Submit for Approval

1. Click **"Submit App"** button (top right)
2. Fill in submission form:
   - **App Type**: Select **"No"** (not publicly available)
   - **App Name**: Forestea Integration App
   - **Description**: Point of sale integration for Forestea cafe
3. Click **"Submit"**

### 6.3 Wait for Approval

- **Timeline**: 1-3 business days
- **Email**: You'll receive approval notification
- **Status**: Check in Developer Dashboard

⏳ **Waiting for Clover approval...**

---

## 🔗 Step 7: Connect Production Clover (After Approval)

### 7.1 Test Website

1. Open https://foresteacafe.com
2. Verify website loads correctly
3. Test navigation, menu pages

### 7.2 Access Admin Settings

1. Go to https://foresteacafe.com/admin/setting
2. Login with admin account (cjhj1025@gmail.com)

### 7.3 Connect Clover

1. Click **"Connect Clover Account"** button
2. You'll be redirected to Clover login
3. Login with **merchant account** (cjhj1025@gmail.com)
4. Review permissions:
   - Read orders, payments
   - Read inventory
   - Ecommerce
5. Click **"Authorize"**
6. You'll be redirected back to foresteacafe.com

### 7.4 Verify Connection

You should see:
```
✓ App configuration: Configured
✓ Connection status: Connected
✓ Connected Merchant ID: M9MMNPP2ERA71
✓ Access token expires: [date]
```

### 7.5 Test Integration

1. Go to https://foresteacafe.com (home page)
2. Check menu loads from real Clover POS
3. Add items to cart
4. Test checkout flow (use test card)

✅ **Production is LIVE!**

---

## ✅ Deployment Checklist

Use this checklist to track progress:

### Database (Neon)
- [ ] Account created
- [ ] Project created
- [ ] Database `forestea_production` created
- [ ] Connection string saved
- [ ] Schema applied (`npx prisma db push`)

### API Server (Railway)
- [ ] Account created
- [ ] Project imported from GitHub
- [ ] Build settings configured
- [ ] Environment variables added (all 10+ variables)
- [ ] Deployment successful
- [ ] Test URL works: `https://xxx.railway.app/health`
- [ ] Custom domain `api.foresteacafe.com` added

### Web App (Vercel)
- [ ] Account created
- [ ] Project imported from GitHub
- [ ] Build settings configured
- [ ] Environment variables added (all 8+ variables)
- [ ] Deployment successful
- [ ] Test URL works: `https://xxx.vercel.app`
- [ ] Custom domain `foresteacafe.com` added

### DNS (Cloudflare)
- [ ] DNS records added (A, CNAME for @, www, api)
- [ ] SSL/TLS set to "Full (strict)"
- [ ] Always Use HTTPS enabled
- [ ] DNS propagation verified

### Clover Integration
- [ ] App settings updated (Site URL, CORS)
- [ ] App submitted for approval
- [ ] Approval received (wait 1-3 days)
- [ ] OAuth connected at `/admin/setting`
- [ ] Connection verified (tokens stored in DB)
- [ ] Menu loads from real POS
- [ ] Checkout flow tested

---

## 🐛 Troubleshooting

### Neon Connection Issues

**Error:** `Connection refused`
```bash
# Check connection string format
postgresql://user:pass@host/database?sslmode=require
#                                    ↑ Must include sslmode
```

**Solution:** Make sure `?sslmode=require` is at the end

### Railway Build Fails

**Error:** `Cannot find module`
```bash
# Check root directory setting
Root Directory: apps/api
```

**Solution:** Make sure root directory is set correctly

### Railway Environment Variables

**Error:** `Clover app credentials are not configured`

**Solution:** Double-check all environment variables are added:
- Check for typos
- Ensure no extra spaces
- Verify quotes are removed

### Vercel Build Fails

**Error:** `Module not found: @forestea/db`

**Solution:** Update build command:
```bash
cd ../.. && pnpm install && cd apps/web && pnpm build
```

This ensures monorepo dependencies are installed.

### DNS Not Resolving

**Error:** `DNS_PROBE_FINISHED_NXDOMAIN`

**Solution:**
- Wait 10-15 minutes for DNS propagation
- Clear browser DNS cache: `chrome://net-internals/#dns`
- Use `nslookup foresteacafe.com` to check

### Clover OAuth Fails

**Error:** `404 Not Found`

**Solution:**
- Verify Site URL is exactly: `https://api.foresteacafe.com/auth`
- Check app is approved (not draft status)
- Try disconnect and reconnect

### CORS Errors in Browser

**Error:** `Access-Control-Allow-Origin`

**Solution:**
- Check `CORS Domain` in Clover settings: `https://foresteacafe.com`
- Verify `WEB_ORIGIN` in Railway: `https://foresteacafe.com`
- Make sure no trailing slash

---

## 📊 Monitoring & Logs

### Railway Logs
1. Go to Railway project
2. Click on service
3. Go to **"Deployments"** → Click latest deployment
4. View logs in real-time

### Vercel Logs
1. Go to Vercel project
2. Click **"Deployments"** → Click latest
3. Click **"View Build Logs"**
4. Check for errors

### Neon Monitoring
1. Go to Neon project
2. Click **"Monitoring"** tab
3. View:
   - Active connections
   - Query performance
   - Storage usage

---

## 🔐 Security Best Practices

### Environment Variables
- ✅ Never commit `.env` files to git
- ✅ Use platform secret stores (Railway, Vercel)
- ✅ Rotate secrets periodically
- ✅ Use different secrets for dev vs production

### Database
- ✅ Use SSL connections (Neon enforces this)
- ✅ Limit database user permissions
- ✅ Enable connection pooling
- ✅ Regular backups (Neon auto-backup)

### API Server
- ✅ HTTPS only (enforced by Railway)
- ✅ Validate all inputs
- ✅ Rate limiting implemented
- ✅ Secure API keys

---

## 💰 Estimated Costs

### Neon (Database)
- **Free Tier**: 0.5 GB storage, good for starting
- **Paid**: Starts at $19/month for more storage/compute

### Railway (API)
- **Free Tier**: $5 credit/month
- **Paid**: ~$5-20/month depending on usage

### Vercel (Web)
- **Free Tier**: Generous limits, good for most sites
- **Paid**: $20/month for Pro (if needed)

### Cloudflare (DNS)
- **Free**: DNS and SSL included
- **Paid**: Optional features

**Total Estimated Cost:**
- Free tier: $0-5/month (with free credits)
- Production: $25-50/month

---

## 🎉 Congratulations!

You've successfully deployed Forestea to production!

**Your live URLs:**
- Website: https://foresteacafe.com
- API: https://api.foresteacafe.com
- Admin: https://foresteacafe.com/admin/setting

**Next steps:**
- Test all features thoroughly
- Monitor error logs
- Set up analytics (optional)
- Add custom Google OAuth (optional)
- Promote to customers!

---

## 📞 Support Resources

- **Neon Docs**: https://neon.tech/docs
- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Clover Docs**: https://docs.clover.com
- **Cloudflare Docs**: https://developers.cloudflare.com

**Need help?** Check the troubleshooting section or contact platform support.
