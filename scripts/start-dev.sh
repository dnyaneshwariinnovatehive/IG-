#!/bin/bash
echo "Starting InnovateGuide v2 in development mode..."

# Check .env exists
if [ ! -f .env ]; then
  echo "ERROR: .env file not found. Copy .env.example to .env and fill in values."
  exit 1
fi

# Start both server and client
npm run dev
