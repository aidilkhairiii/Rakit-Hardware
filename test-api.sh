#!/bin/bash

# Test script for AWS API Gateway endpoints
# Usage: ./test-api.sh <your-api-gateway-url>

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if URL is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Please provide your API Gateway URL${NC}"
    echo "Usage: ./test-api.sh https://abc123.execute-api.us-east-1.amazonaws.com/dev"
    exit 1
fi

API_URL=$1

echo -e "${YELLOW}Testing Rakit Hardware API Gateway...${NC}\n"

# Test 1: Blood Pressure Endpoint
echo -e "${YELLOW}Test 1: Blood Pressure (BP) Endpoint${NC}"
BP_RESPONSE=$(curl -s -X POST "${API_URL}/api/data" \
  -H "Content-Type: application/json" \
  -d '{"value":"Result: 120 / 80, BPM : 72"}')

echo "Response: $BP_RESPONSE"

if echo "$BP_RESPONSE" | grep -q "success.*true"; then
    echo -e "${GREEN}✅ BP endpoint working!${NC}\n"
else
    echo -e "${RED}❌ BP endpoint failed!${NC}\n"
fi

# Test 2: SpO2 Endpoint
echo -e "${YELLOW}Test 2: SpO2 Endpoint${NC}"
SPO2_RESPONSE=$(curl -s -X POST "${API_URL}/api/spo2" \
  -H "Content-Type: application/json" \
  -d '{"value":"SpO2 : 98%, BPM : 75"}')

echo "Response: $SPO2_RESPONSE"

if echo "$SPO2_RESPONSE" | grep -q "success.*true"; then
    echo -e "${GREEN}✅ SpO2 endpoint working!${NC}\n"
else
    echo -e "${RED}❌ SpO2 endpoint failed!${NC}\n"
fi

# Test 3: Temperature Endpoint
echo -e "${YELLOW}Test 3: Temperature Endpoint${NC}"
TEMP_RESPONSE=$(curl -s -X POST "${API_URL}/api/temp" \
  -H "Content-Type: application/json" \
  -d '{"value":"37.5°C"}')

echo "Response: $TEMP_RESPONSE"

if echo "$TEMP_RESPONSE" | grep -q "success.*true"; then
    echo -e "${GREEN}✅ Temperature endpoint working!${NC}\n"
else
    echo -e "${RED}❌ Temperature endpoint failed!${NC}\n"
fi

echo -e "${YELLOW}Testing complete!${NC}"
echo -e "\n${GREEN}Your API URL for Android: ${API_URL}${NC}"
