#!/bin/bash

URL="http://localhost:3000/api/webhook/pakasir"
ORDER_ID=$1
AMOUNT=$2

if [ -z "$ORDER_ID" ] || [ -z "$AMOUNT" ]; then
    echo "Usage: ./scripts/simulate_webhook.sh <ORDER_ID> <AMOUNT>"
    echo "Example: ./scripts/simulate_webhook.sh SUB_abc123 199000"
    exit 1
fi

PROJECT_SLUG="go-ai"

echo "Simulating successful Pakasir Sandbox Payment for Order: $ORDER_ID ($AMOUNT IDR)"

curl -X POST $URL \
  -H "Content-Type: application/json" \
  -d '{
    "project": "'$PROJECT_SLUG'",
    "order_id": "'$ORDER_ID'",
    "status": "completed",
    "amount": '$AMOUNT',
    "payment_method": "qris"
  }'

echo ""
echo "Webhook ping sent to $URL"
