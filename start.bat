@echo off
title CIC Club Startup

echo ==========================================
echo      CIC CLUB STARTING SERVICES
echo ==========================================
echo.

REM ==========================================
REM Build Sandbox Image
REM ==========================================

echo [1/5] Building Sandbox Image...
docker build -f dockerfile.sandbox -t cic-sandbox:latest .

echo.
echo ==========================================
echo.

REM ==========================================
REM Start MongoDB
REM ==========================================

echo [2/5] Starting MongoDB...
docker compose -f docker.compose.yml up -d mongodb

echo.
echo ==========================================
echo.

REM ==========================================
REM Backend
REM ==========================================

echo [3/5] Starting Backend...

start "CIC Backend" cmd /k ^
"cd backend && npm install && npm run dev"

echo.
echo ==========================================
echo.

REM ==========================================
REM Frontend
REM ==========================================

echo [4/5] Starting Frontend...

start "CIC Frontend" cmd /k ^
"rmdir /s /q node_modules\.vite 2>nul & npm install & npm run dev -- --force"

echo.
echo ==========================================
echo.

REM ==========================================
REM Docker Status
REM ==========================================

echo [5/5] Docker Containers:
docker ps

echo.
echo ==========================================
echo Backend  : http://localhost:5000
echo Frontend : http://localhost:5173
echo MongoDB  : localhost:27017
echo ==========================================

pause