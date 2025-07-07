#!/bin/bash
set -e

echo "Deploying Production Environment..."

read -p "Are you sure you want to deploy to PROD? (y/n): " confirm

if [[ "$confirm" != "y" ]]; then
  echo "Aborted."
  exit 1
fi

echo "Pulling latest code..."
git pull

echo "Applying .env.prod..."
cp .env.prod .env

echo "Restarting PROD services..."
docker-compose -p prod down
docker-compose -p prod up --build -d
docker-compose exec api bin/rails db:migrate

echo "PROD deployment complete. Ports: 7090 (client), 7091 (API)"
