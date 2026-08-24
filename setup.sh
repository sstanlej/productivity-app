#!/bin/bash
echo "Starting database..."
docker compose up -d

echo "Updating database schema..."
cd ProductivityApp.Api && dotnet ef database update && cd ..

echo "Installing frontend dependencies..."
cd ProductivityApp.Client && npm install --legacy-peer-deps && cd ..

echo "Ready to run!"