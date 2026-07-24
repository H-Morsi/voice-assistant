@echo off
title Voice Assistant - Installer
color 0A
echo.
echo  ============================================================
echo   Voice Assistant - One-Click Installer
echo  ============================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found!
    echo.
    echo Please install Node.js 18+ from: https://nodejs.org
    echo Then run this installer again.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found: 
node --version
echo.

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm not found (should come with Node.js)
    pause
    exit /b 1
)

echo [OK] npm found:
npm --version
echo.

REM Install dependencies
echo.
echo [STEP 1/3] Installing dependencies (this may take 30-60 seconds)...
echo.
npm install
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] npm install failed!
    echo Check your internet connection and try again.
    pause
    exit /b 1
)

echo.
echo [OK] Dependencies installed.
echo.

REM Build production app
echo [STEP 2/3] Building production app...
echo.
npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo.
echo [OK] Build complete.
echo.

REM Build Electron installer
echo [STEP 3/3] Building Windows installer (.exe)...
echo This may take 1-2 minutes...
echo.
npm run electron:build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Electron build failed!
    pause
    exit /b 1
)

echo.
echo  ============================================================
echo   [SUCCESS] Installation complete!
echo  ============================================================
echo.
echo The installer (.exe) and portable app are in:
echo   dist-electron\
echo.
echo Next step: Double-click  RUN.bat  to launch the app.
echo.
pause