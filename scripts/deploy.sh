#!/bin/bash
set -e
echo "=== InnovateGuide v2 Deployment ==="

# Pull latest code
echo "Pulling latest code..."
git pull origin main

# Install dependencies
echo "Installing backend dependencies..."
npm install --prefix server --production

echo "Installing frontend dependencies..."
npm install --prefix client

# Build frontend
echo "Building frontend..."
npm run build --prefix client

# Restart API
echo "Restarting API server..."
pm2 restart innovateguide-api || pm2 start ecosystem.config.js --env production

# Reload Nginx
echo "Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "=== Deployment complete! ==="
pm2 status
