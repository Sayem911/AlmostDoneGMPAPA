#!/bin/bash

# Stop any running instances
pm2 stop gmpapa || true

# Install dependencies
npm install

# Build the application
npm run build

# Start the application with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Configure Nginx
sudo cp nginx.conf /etc/nginx/sites-available/gmpapa
sudo ln -sf /etc/nginx/sites-available/gmpapa /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo "Deployment complete!"