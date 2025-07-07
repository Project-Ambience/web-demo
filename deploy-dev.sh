#!/bin/bash
set -e

echo "Deploying Development Environment..."

echo "Pulling latest code..."
git pull

echo "Applying .env.dev..."
cp .env.dev .env

echo "Restarting DEV services..."
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build -d
docker-compose -f docker-compose.dev.yml exec api bin/rails db:migrate

echo "DEV deployment complete. Ports: 5090 (client), 5091 (API)"
