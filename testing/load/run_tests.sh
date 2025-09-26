#!/bin/bash

# Load Testing Script for SweatTogether
# This script runs performance tests to measure the impact of Redis caching and WebSocket optimization

echo "🚀 Starting SweatTogether Load Tests"
echo "====================================="

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo "❌ k6 is not installed. Please install it first:"
    echo "   brew install k6"
    exit 1
fi

# Check if artillery is installed
if ! command -v artillery &> /dev/null; then
    echo "❌ artillery is not installed. Please install it first:"
    echo "   npm install -g artillery"
    exit 1
fi

# Create results directory
mkdir -p results

echo ""
echo "📊 Test 1: Baseline Performance (Redis OFF, WebSocket OFF)"
echo "=========================================================="
echo "Starting server with CACHE_ENABLED=false WEBSOCKET_ENABLED=false"
echo ""

# Start server with features disabled
CACHE_ENABLED=false WEBSOCKET_ENABLED=false npm run dev &
SERVER_PID=$!

# Wait for server to start
sleep 10

echo "Running HTTP load test (baseline)..."
k6 run --out json=results/baseline_http.json http_test.js

echo "Running WebSocket load test (baseline)..."
k6 run --out json=results/baseline_ws.json ws_test.js

echo "Running Artillery HTTP test (baseline)..."
artillery run artillery_http.yaml --output results/baseline_artillery.json

# Kill the server
kill $SERVER_PID
sleep 5

echo ""
echo "📈 Test 2: Optimized Performance (Redis ON, WebSocket ON)"
echo "========================================================"
echo "Starting server with CACHE_ENABLED=true WEBSOCKET_ENABLED=true"
echo ""

# Start server with features enabled
CACHE_ENABLED=true WEBSOCKET_ENABLED=true npm run dev &
SERVER_PID=$!

# Wait for server to start
sleep 10

echo "Running HTTP load test (optimized)..."
k6 run --out json=results/optimized_http.json http_test.js

echo "Running WebSocket load test (optimized)..."
k6 run --out json=results/optimized_ws.json ws_test.js

echo "Running Artillery HTTP test (optimized)..."
artillery run artillery_http.yaml --output results/optimized_artillery.json

# Kill the server
kill $SERVER_PID

echo ""
echo "📋 Test 3: Cache Performance Analysis"
echo "===================================="
echo "Testing cache hit/miss scenarios..."

# Start server with Redis enabled
CACHE_ENABLED=true WEBSOCKET_ENABLED=true npm run dev &
SERVER_PID=$!

sleep 10

echo "Running cache warm-up test..."
k6 run --out json=results/cache_warmup.json http_test.js

echo "Running cache hit test..."
k6 run --out json=results/cache_hit.json http_test.js

kill $SERVER_PID

echo ""
echo "✅ All tests completed!"
echo "======================"
echo "Results saved in:"
echo "  - results/baseline_http.json"
echo "  - results/baseline_ws.json"
echo "  - results/optimized_http.json"
echo "  - results/optimized_ws.json"
echo "  - results/cache_warmup.json"
echo "  - results/cache_hit.json"
echo ""
echo "📊 To analyze results:"
echo "  k6 run --out csv=results/summary.csv http_test.js"
echo "  artillery report results/baseline_artillery.json"
echo "  artillery report results/optimized_artillery.json"
