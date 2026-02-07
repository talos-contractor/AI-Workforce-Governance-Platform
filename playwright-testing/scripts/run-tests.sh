#!/bin/bash
# Run Playwright tests for AWGP

set -e

echo "🎭 AWGP Playwright Test Runner"
echo "================================"

# Check if Playwright is installed
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules/@playwright/test" ]; then
    echo "📦 Installing Playwright..."
    npm install @playwright/test
    npx playwright install
fi

# Check if app is running
echo "🔍 Checking if app is running..."
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "⚠️  App doesn't appear to be running on localhost:3000"
    echo "    Please start the app first: npm run dev"
    exit 1
fi

echo "✅ App is running"
echo ""

# Run tests
echo "🚀 Running tests..."
echo ""

case "${1:-all}" in
    "headed")
        npx playwright test --headed
        ;;
    "debug")
        npx playwright test --debug
        ;;
    "ui")
        npx playwright test --ui
        ;;
    "api")
        npx playwright test tests/api.spec.ts
        ;;
    "auth")
        npx playwright test tests/auth.spec.ts
        ;;
    *)
        npx playwright test
        ;;
esac

echo ""
echo "✅ Tests complete!"
echo "📊 View report: npx playwright show-report"
