@echo off
REM ============================================================
REM Voice Assistant - Bulletproof Installer
REM ============================================================
REM This file has PAUSE after EVERY step so you see exactly
REM where it stops. Run in Command Prompt (cmd.exe), not PowerShell.
REM ============================================================

echo.
echo ============================================================
echo  Voice Assistant - Installer (DEBUG MODE)
echo ============================================================
echo.
echo Current folder: %CD%
echo.
pause

REM ------------------------------------------------------------
REM Step 0: Verify we're in the right folder
REM ------------------------------------------------------------
echo.
echo [STEP 0] Checking for package.json...
if exist package.json (
    echo [OK] package.json found
) else (
    echo [ERROR] package.json NOT found!
    echo Please run this from the voice-assistant folder.
    pause
    exit /b 1
)
pause

REM ------------------------------------------------------------
REM Step 1: Check Node.js
REM ------------------------------------------------------------
echo.
echo [STEP 1] Checking Node.js...
where node >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] node found in PATH
    node --version
) else (
    echo [ERROR] 'node' command not found!
    echo Install Node.js from https://nodejs.org
    pause
    exit /b 1
)
pause

REM ------------------------------------------------------------
REM Step 2: Check npm
REM ------------------------------------------------------------
echo.
echo [STEP 2] Checking npm...
where npm >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] npm found in PATH
    npm --version
) else (
    echo [ERROR] 'npm' command not found!
    echo Reinstall Node.js from https://nodejs.org
    pause
    exit /b 1
)
pause

REM ------------------------------------------------------------
REM Step 3: Install dependencies
REM ------------------------------------------------------------
echo.
echo [STEP 3] Installing dependencies (this takes 30-60 seconds)...
echo Running: npm install
npm install
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] npm install failed!
    echo.
    echo Common fixes:
    echo   - Run as Administrator (right-click -> Run as administrator)
    echo   - Check internet connection
    echo   - Try: npm cache clean --force
    pause
    exit /b 1
)
echo [OK] Dependencies installed.
pause

REM ------------------------------------------------------------
REM Step 4: Build production app
REM ------------------------------------------------------------
echo.
echo [STEP 4] Building production app...
echo Running: npm run build
npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed!
    pause
    exit /b 1
)
echo [OK] Build complete.
pause

REM ------------------------------------------------------------
REM Step 5: Build Windows installer
REM ------------------------------------------------------------
echo.
echo [STEP 5] Building Windows installer (.exe)...
echo This takes 1-2 minutes...
echo Running: npm run electron:build
npm run electron:build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Electron build failed!
    pause
    exit /b 1
)
echo [OK] Installer created in dist-electron\
pause

REM ------------------------------------------------------------
REM SUCCESS
REM ------------------------------------------------------------
echo.
echo ============================================================
echo  [SUCCESS] Installation complete!
echo ============================================================
echo.
echo Files created in dist-electron\:
echo   Voice Assistant Setup 1.0.0.exe   (full installer)
echo   Voice Assistant-1.0.0.exe         (portable)
echo.
echo Next: Double-click RUN.bat to launch.
echo.
pause