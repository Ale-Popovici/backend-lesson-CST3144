#!/bin/bash

echo "Stopping all PM2 processes..."
pm2 stop all

echo "Deleting all PM2 processes..."
pm2 delete all

echo "Clearing PM2 logs..."
pm2 flush

echo "Loading environment variables..."
source /etc/environment

echo "Starting application..."
pm2 start ecosystem.config.js

echo "Saving PM2 configuration..."
pm2 save

echo "Current PM2 status:"
pm2 list

echo "Checking application logs..."
pm2 logs --lines 20