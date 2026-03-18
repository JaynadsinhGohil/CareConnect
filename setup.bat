@echo off
REM CareConnect Setup Script for Windows

setlocal enabledelayedexpansion

echo ================================
echo CareConnect Setup
echo ================================

REM Step 1: Check prerequisites
echo.
echo Checking prerequisites...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo X Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/
    pause
    exit /b 1
)

where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo X PostgreSQL is not installed. Please install PostgreSQL from https://www.postgresql.org/download/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo + Node.js %NODE_VERSION%

where psql >nul 2>nul
echo + PostgreSQL installed

REM Step 2: Setup backend
echo.
echo Setting up backend...

cd backend

if not exist ".env" (
    copy .env.example .env
    echo + Created .env file in backend\
    echo   ! Please update database credentials if needed
)

if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
    if errorlevel 1 (
        echo X Backend installation failed
        cd ..
        pause
        exit /b 1
    )
    echo + Backend dependencies installed
) else (
    echo + Backend dependencies already installed
)

cd ..

REM Step 3: Setup frontend
echo.
echo Setting up frontend...

if not exist ".env.local" (
    (
        echo VITE_API_URL=http://localhost:5000/api
    ) > .env.local
    echo + Created .env.local file
)

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
    if errorlevel 1 (
        echo X Frontend installation failed
        pause
        exit /b 1
    )
    echo + Frontend dependencies installed
) else (
    echo + Frontend dependencies already installed
)

REM Step 4: Instructions
echo.
echo ================================
echo Setup Complete!
echo ================================
echo.
echo Start the application:
echo.
echo Terminal 1 - Backend:
echo   cd backend ^&^& npm run dev
echo.
echo Terminal 2 - Frontend:
echo   npm run dev
echo.
echo Demo Credentials:
echo   Admin:        admin@careconnect.com / password
echo   Doctor:       doctor@careconnect.com / password  
echo   Receptionist: reception@careconnect.com / password
echo   Patient:      patient@careconnect.com / password
echo.
echo Access the app at: http://localhost:5173
echo.
pause
