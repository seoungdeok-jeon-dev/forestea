#!/bin/bash

# Forestea Database Setup Script

echo "🗄️  Forestea Database Setup"
echo "=========================="
echo ""

# Color definitions
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Create databases
echo "📦 Step 1: Creating databases..."
echo ""

psql postgresql://forestea:forestea@localhost:5432/postgres << EOF
-- Development DB
CREATE DATABASE forestea_development;
-- Production DB
CREATE DATABASE forestea_production;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Databases created${NC}"
else
    echo -e "${YELLOW}⚠ Databases may already exist, continuing...${NC}"
fi

echo ""

# Step 2: Apply schema to development DB
echo "📋 Step 2: Applying schema to forestea_development..."
cd packages/db
DATABASE_URL="postgresql://forestea:forestea@localhost:5432/forestea_development" npx prisma db push --accept-data-loss

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Development DB schema applied${NC}"
else
    echo -e "${RED}✗ Development DB schema failed${NC}"
    exit 1
fi

echo ""

# Step 3: Apply schema to production DB
echo "📋 Step 3: Applying schema to forestea_production..."
DATABASE_URL="postgresql://forestea:forestea@localhost:5432/forestea_production" npx prisma db push --accept-data-loss

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Production DB schema applied${NC}"
else
    echo -e "${RED}✗ Production DB schema failed${NC}"
    exit 1
fi

cd ../..

echo ""
echo "=========================="
echo -e "${GREEN}✨ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Start development: cd apps/api && pnpm dev"
echo "2. Start web app: cd apps/web && pnpm dev"
echo "3. Connect OAuth at http://localhost:3000/admin/setting"
echo ""
