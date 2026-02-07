#!/bin/bash
# Chrome DevTools diagnostic checklist for AWGP

echo "🔍 AWGP Diagnostic Checklist"
echo "==========================="
echo ""

# Check if app is running
echo "1. Checking if app is running..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ App running on http://localhost:3000"
else
    echo "   ❌ App not running. Start with: npm run dev"
    exit 1
fi

# Check environment file
echo ""
echo "2. Checking environment variables..."
if [ -f "apps/web/.env" ]; then
    echo "   ✅ .env file exists"
    if grep -q "VITE_SUPABASE_URL" apps/web/.env; then
        echo "   ✅ VITE_SUPABASE_URL found"
    else
        echo "   ❌ VITE_SUPABASE_URL missing"
    fi
else
    echo "   ❌ .env file missing in apps/web/"
fi

# Check if Supabase is accessible
echo ""
echo "3. Checking Supabase connection..."
if command -v curl &> /dev/null; then
    SUPABASE_URL=$(grep VITE_SUPABASE_URL apps/web/.env 2>/dev/null | cut -d'=' -f2)
    if [ -n "$SUPABASE_URL" ]; then
        if curl -s "$SUPABASE_URL/rest/v1/" -H "apikey: test" > /dev/null 2>&1; then
            echo "   ✅ Supabase URL reachable"
        else
            echo "   ⚠️  Supabase URL may be blocked by CORS or invalid"
        fi
    fi
fi

# Check for common issues
echo ""
echo "4. Common issues to check in DevTools:"
echo "   • Open http://localhost:3000 in Chrome"
echo "   • Press F12 to open DevTools"
echo "   • Check Console tab for red errors"
echo "   • Check Network tab for failed requests"
echo "   • Check Application tab for localStorage"

echo ""
echo "📋 DevTools debugging commands:"
echo "   console.log(import.meta.env.VITE_SUPABASE_URL)"
echo "   console.log(supabase)"
echo "   console.clear()"

echo ""
echo "✅ Diagnostic complete!"
