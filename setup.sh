#!/bin/bash

# CareConnect Setup Script
# This script sets up the entire application

set -e

echo "================================"
echo "CareConnect Setup"
echo "================================"

# Step 1: Check prerequisites
echo ""
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL from https://www.postgresql.org/download/"
    exit 1
fi

echo "✓ Node.js $(node --version)"
echo "✓ PostgreSQL $(psql --version)"

# Step 2: Setup backend
echo ""
echo "Setting up backend..."

cd backend

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✓ Created .env file in backend/"
    echo "  ⚠ Please update database credentials if needed"
fi

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo "✓ Dependencies installed"
else
    echo "✓ Dependencies already installed"
fi

cd ..

# Step 3: Setup frontend
echo ""
echo "Setting up frontend..."

if [ ! -f ".env.local" ]; then
    cat > .env.local << EOF
VITE_API_URL=http://localhost:5000/api
EOF
    echo "✓ Created .env.local file"
fi

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo "✓ Dependencies installed"
else
    echo "✓ Dependencies already installed"
fi

# Step 4: Instructions
echo ""
echo "================================"
echo "Setup Complete! 🎉"
echo "================================"
echo ""
echo "Start the application:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend && npm run dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "  npm run dev"
echo ""
echo "Demo Credentials:"
echo "  Admin:       admin@careconnect.com / password"
echo "  Doctor:      doctor@careconnect.com / password"
echo "  Receptionist: reception@careconnect.com / password"
echo "  Patient:     patient@careconnect.com / password"
echo ""
echo "Access the app at: http://localhost:5173"
echo ""
