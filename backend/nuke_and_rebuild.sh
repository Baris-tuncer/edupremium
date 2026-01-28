#!/bin/bash

# ============================================
# EDUPREMIUM - NUKE & REBUILD SCRIPT
# Tarih: 19 Ocak 2026
# ============================================

set -e  # Hata durumunda dur

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BACKEND_DIR=~/Desktop/edupremium/backend

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   EDUPREMIUM - NUKE & REBUILD              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Backend dizinine git
cd "$BACKEND_DIR" || { echo -e "${RED}❌ Backend dizini bulunamadı: $BACKEND_DIR${NC}"; exit 1; }
echo -e "${GREEN}✓${NC} Çalışma dizini: $(pwd)"
echo ""

# ============================================
# ADIM 1: RADİKAL TEMİZLİK
# ============================================
echo -e "${YELLOW}━━━ ADIM 1: RADİKAL TEMİZLİK ━━━${NC}"

echo -n "  🗑️  dist/ siliniyor... "
rm -rf dist && echo -e "${GREEN}OK${NC}"

echo -n "  🗑️  node_modules/ siliniyor... "
rm -rf node_modules && echo -e "${GREEN}OK${NC}"

echo -n "  🗑️  *.tsbuildinfo siliniyor... "
rm -f tsconfig.tsbuildinfo .tsbuildinfo 2>/dev/null
find . -name "*.tsbuildinfo" -delete 2>/dev/null || true
echo -e "${GREEN}OK${NC}"

echo ""

# ============================================
# ADIM 2: YENİDEN KURULUM
# ============================================
echo -e "${YELLOW}━━━ ADIM 2: YENİDEN KURULUM ━━━${NC}"

echo "  📦 npm install çalıştırılıyor..."
npm install --silent
echo -e "  ${GREEN}✓${NC} Paketler kuruldu"

echo ""

# ============================================
# ADIM 3: PRİSMA GENERATE
# ============================================
echo -e "${YELLOW}━━━ ADIM 3: PRİSMA GENERATE ━━━${NC}"

echo "  🔧 npx prisma generate çalıştırılıyor..."
npx prisma generate --schema=./prisma/schema.prisma
echo -e "  ${GREEN}✓${NC} Prisma client oluşturuldu"

echo ""

# ============================================
# ADIM 4: BUILD
# ============================================
echo -e "${YELLOW}━━━ ADIM 4: BUILD ━━━${NC}"

echo "  🏗️  npm run build çalıştırılıyor..."
npm run build
echo -e "  ${GREEN}✓${NC} Build tamamlandı"

echo ""

# ============================================
# ADIM 5: DOĞRULAMA
# ============================================
echo -e "${YELLOW}━━━ ADIM 5: DOĞRULAMA ━━━${NC}"

# dist/main.js kontrolü
if [ -f "dist/main.js" ]; then
    echo -e "  ${GREEN}✓${NC} dist/main.js mevcut"
else
    echo -e "  ${RED}✗${NC} dist/main.js bulunamadı!"
    exit 1
fi

# [object Object] kontrolü
if [ -f "dist/modules/auth/auth.service.js" ]; then
    if grep -q "\[object Object\]" dist/modules/auth/auth.service.js 2>/dev/null; then
        echo -e "  ${RED}✗${NC} HATA: Derlenmiş dosyada '[object Object]' bulundu!"
        exit 1
    else
        echo -e "  ${GREEN}✓${NC} '[object Object]' sorunu YOK"
    fi
fi

# getMe fonksiyonu kontrolü
echo -n "  🔍 auth.service.js getMe kontrolü: "
grep -o "async getMe([^)]*)" dist/modules/auth/auth.service.js 2>/dev/null || echo "bulunamadı"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ KURULUM BAŞARIYLA TAMAMLANDI!         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Şimdi sunucuyu başlatmak için:"
echo ""
echo -e "  ${BLUE}node dist/main.js${NC}"
echo ""
echo -e "Test için yeni terminal açıp:"
echo ""
echo -e "  ${BLUE}# 1. Login${NC}"
echo -e "  curl -s -X POST http://localhost:4000/auth/login \\"
echo -e "    -H 'Content-Type: application/json' \\"
echo -e "    -d '{\"email\":\"admin@edupremium.com\",\"password\":\"Admin123!\"}'"
echo ""
echo -e "  ${BLUE}# 2. /auth/me test (TOKEN'ı yukarıdan kopyala)${NC}"
echo -e "  curl -X GET http://localhost:4000/auth/me \\"
echo -e "    -H 'Authorization: Bearer TOKEN_BURAYA'"
echo ""
