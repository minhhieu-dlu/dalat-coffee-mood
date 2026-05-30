#!/usr/bin/env bash
# Wait for a HTTP endpoint to return 200
URL=${1:-http://localhost:3000}
TIMEOUT=${2:-60}
SECS=0
while true; do
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$URL" || echo 000)
  if [ "$HTTP" = "200" ] || [ "$HTTP" = "302" ]; then
    echo "OK: $URL responded $HTTP"
    exit 0
  fi
  if [ $SECS -ge $TIMEOUT ]; then
    echo "Timeout waiting for $URL"
    exit 1
  fi
  SECS=$((SECS+2))
  sleep 2
done
