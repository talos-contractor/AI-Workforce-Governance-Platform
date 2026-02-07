#!/bin/bash
# Seed the AWGP database from command line using Supabase CLI
# No need to open the Supabase website

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🌱 AWGP Database Seeder"
echo "======================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo ""
    echo "Install it:"
    echo "  npm install -g supabase"
    echo "  OR"
    echo "  brew install supabase (Mac)"
    echo "  OR"
    echo "  npx supabase ..."
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI found${NC}"

# Check if we're in the project directory
if [ ! -f "scripts/seed-sample-data.sql" ]; then
    echo -e "${RED}❌ Error: seed-sample-data.sql not found${NC}"
    echo "Run this script from the project root directory:"
    echo "  ./scripts/seed-db.sh"
    exit 1
fi

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${GREEN}✅ Environment variables loaded from .env${NC}"
elif [ -f "apps/web/.env" ]; then
    export $(cat apps/web/.env | grep -v '^#' | xargs)
    echo -e "${GREEN}✅ Environment variables loaded from apps/web/.env${NC}"
else
    echo -e "${YELLOW}⚠️  No .env file found${NC}"
    echo "Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set"
fi

# Check for required env vars
if [ -z "$SUPABASE_URL" ] && [ -z "$VITE_SUPABASE_URL" ]; then
    echo -e "${RED}❌ Missing SUPABASE_URL environment variable${NC}"
    echo "Set it in .env file or export it:"
    echo "  export SUPABASE_URL=https://your-project.supabase.co"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable${NC}"
    echo "Get it from Supabase Dashboard → Settings → API → service_role key"
    echo "  export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables set${NC}"

# Extract project ref from URL
PROJECT_URL="${SUPABASE_URL:-$VITE_SUPABASE_URL}"
PROJECT_REF=$(echo "$PROJECT_URL" | sed 's/https:\/\/\(.*\)\.supabase\.co/\1/')
echo "📁 Project: $PROJECT_REF"
echo ""

# Method 1: Try using Supabase CLI (if linked to local project)
echo "🔄 Attempting to seed via Supabase CLI..."
if supabase status &> /dev/null; then
    echo "Using linked Supabase project..."
    supabase db reset --skip-seed || true
    supabase db execute < scripts/seed-sample-data.sql
    echo -e "${GREEN}✅ Database seeded successfully via CLI${NC}"
    exit 0
fi

# Method 2: Use PostgreSQL direct connection (if available)
echo "⚠️  No local Supabase project linked"
echo "🔄 Trying direct PostgreSQL connection..."

# Extract password from service role key (it's a JWT, need to get from Supabase dashboard)
# For direct PostgreSQL, we'd need the database password from Supabase dashboard
# This is complex, so let's try HTTP API instead

# Method 3: Use Supabase HTTP API (if service role key works)
echo "🔄 Trying Supabase HTTP API..."

echo ""
echo "📖 To seed the database, run this SQL in Supabase Dashboard:"
echo "   https://app.supabase.com/project/${PROJECT_REF}/editor"
echo ""
echo -e "${YELLOW}Or manually run:${NC}"
echo "   cat scripts/seed-sample-data.sql | psql <your-connection-string>"
echo ""

# For now, display the SQL for copy/paste
echo "📄 SQL Script Preview:"
echo "======================"
head -20 scripts/seed-sample-data.sql
echo "... (full script has $(wc -l < scripts/seed-sample-data.sql) lines)"
echo ""

echo -e "${YELLOW}⚠️  Note: For full automation, you need:${NC}"
echo "   1. Supabase CLI linked to your project, OR"
echo "   2. PostgreSQL direct connection (password from dashboard), OR"
echo "   3. Run the SQL manually in Supabase SQL Editor"
echo ""
echo "🔗 Quick access:"
echo "   https://app.supabase.com/project/${PROJECT_REF}/sql"
echo ""

# Optional: Copy to clipboard (if available)
if command -v pbcopy &> /dev/null; then
    cat scripts/seed-sample-data.sql | pbcopy
    echo -e "${GREEN}✅ SQL copied to clipboard (Mac)${NC}"
elif command -v xclip &> /dev/null; then
    cat scripts/seed-sample-data.sql | xclip -selection clipboard
    echo -e "${GREEN}✅ SQL copied to clipboard (Linux)${NC}"
elif command -v clip.exe &> /dev/null; then
    cat scripts/seed-sample-data.sql | clip.exe
    echo -e "${GREEN}✅ SQL copied to clipboard (Windows/WSL)${NC}"
fi

# Print instructions
if command -v supabase &> /dev/null; then
    echo ""
    echo "💡 To link your project and enable CLI seeding:"
    echo "   cd /path/to/project"
    echo "   supabase login"
    echo "   supabase link --project-ref $PROJECT_REF"
    echo "   supabase db execute < scripts/seed-sample-data.sql"
fi

exit 0
