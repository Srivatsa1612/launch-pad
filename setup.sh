#!/bin/bash

# flowCUSTODIAN Wizard Setup Script
# This script automates the initial setup process

set -e

echo "======================================"
echo "flowCUSTODIAN Wizard Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js version
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18 or higher.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18 or higher is required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm $(npm -v)${NC}"
echo ""

# Setup backend
echo "Setting up backend..."
cd backend

if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ Creating .env from .env.example${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠ Please edit backend/.env with your Microsoft Fabric credentials${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

echo "Installing backend dependencies..."
npm install

echo -e "${GREEN}✓ Backend setup complete${NC}"
echo ""

# Setup frontend
echo "Setting up frontend..."
cd ../frontend

if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ Creating .env from .env.example${NC}"
    cp .env.example .env
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

echo "Installing frontend dependencies..."
npm install

echo -e "${GREEN}✓ Frontend setup complete${NC}"
echo ""

# Done
echo "======================================"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your Microsoft Fabric credentials:"
echo "   - LIVY_ENDPOINT"
echo "   - FABRIC_TOKEN"
echo "   - WORKSPACE_ID"
echo "   - LAKEHOUSE_ID"
echo ""
echo "2. Start the development servers:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm start"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "For detailed instructions, see SETUP_GUIDE.md"
echo ""
