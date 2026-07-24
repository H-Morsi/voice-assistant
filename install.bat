@echo off
setlocal EnableDelayedExpansion

title Voice Assistant - Installer
color 0A
mode con: cols=90 lines=40

echo.
echo  ============================================================
echo   Voice Assistant - One-Click Installer
echo  ============================================================
echo.

REM ============================================================
REM DEBUG: Show we started
REM ============================================================
echo [DEBUG] Script started from: %CD%
echo [DEBUG] Command line: %*
echo.

REM ============================================================
REM Find Node.js (simplified - trust PATH first)
REM ============================================================
set "NODE_CMD=node"
set "NPM_CMD=npm"

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] 'node' not found in PATH.
    echo         Install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] 'npm' not found in PATH.
    echo         Reinstall Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node --version') do set "NODE_VERSION=%%v"
for /f "tokens=*" %%v in ('npm --version') do set "NPM_VERSION=%%v"

echo [OK] Node.js: %NODE_VERSION%
echo [OK] npm:     %NPM_VERSION%
echo.

REM ============================================================
REM Check package.json
REM ============================================================
if not exist "package.json" (
    echo [ERROR] package.json not found in %CD%
    echo         Run this from the voice-assistant folder.
    echo.
    pause
    exit /b 1
)

echo [OK] Found package.json
echo.

REM ============================================================
REM STEP 1: Install deps
REM ============================================================
echo [1/3] Installing dependencies (downloads ~200MB first time)...
npm install
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] npm install failed.
    echo.
    echo Try: npm cache clean --force
    echo Or run as Administrator.
    echo.
    pause
    exit /b 1
)
echo [OK] Dependencies installed.
echo.

REM ============================================================
REM STEP 2: Build
REM ============================================================
echo [2/3] Building production app...
npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed.
    echo.
    pause
    exit /b 1
)
echo [OK] Build complete.
echo.

REM ============================================================
REM STEP 3: Electron build
REM ============================================================
echo [3/3] Building Windows installer (.exe)...
echo         This takes 1-2 minutes...
npm run electron:build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Electron build failed.
    echo.
    pause
    exit /b 1
)

REM ============================================================
REM SUCCESS
REM ============================================================
echo.
echo  ============================================================
echo   [SUCCESS] Done! Installer created in dist-electron\
echo  ============================================================
echo.
echo Files created:
echo   dist-electron\Voice Assistant Setup 1.0.0.exe   (installer)
echo   dist-electron\Voice Assistant-1.0.0.exe         (portable)
echo.
echo Next: Double-click RUN.bat to launch.
echo.
pause