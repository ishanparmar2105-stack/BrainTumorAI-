#!/bin/bash

# BrainTumorAI dev server runner
# Starts both FastAPI backend and Vite React frontend concurrently

# Project directories
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Colors for log statements
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting BrainTumorAI Application ===${NC}"

# Trap SIGINT (Ctrl+C) to terminate both servers cleanly
cleanup() {
    echo -e "\n${BLUE}Stopping all servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}
trap cleanup SIGINT

# Step 1: Start FastAPI Backend
echo -e "${GREEN}Starting FastAPI backend on http://localhost:8000...${NC}"
cd "$BACKEND_DIR"
/opt/homebrew/bin/python3.11 run.py &
BACKEND_PID=$!

# Wait 2 seconds for backend to initialize
sleep 2

# Step 2: Start Vite Frontend
echo -e "${GREEN}Starting React frontend dev server...${NC}"
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!

# Wait for user termination
wait
