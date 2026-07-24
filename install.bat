@echo off
setlocal EnableDelayedExpansion

title Voice Assistant - One-Click Installer
color 0A
mode con: cols=90 lines=45

echo.
echo  ============================================================
echo   Voice Assistant - One-Click Installer for Windows
echo  ============================================================
echo.
echo  This will install dependencies, build the app, and create
echo  a Windows installer (.exe).
echo.
echo  Estimated time: 2-5 minutes (first run downloads ~200MB)
echo.

REM ============================================================
REM Helper: Keep window open on exit (success or failure)
REM ============================================================
:KEEP_OPEN
echo.
echo  ------------------------------------------------------------
echo  Press ANY KEY to close this window...
echo  ------------------------------------------------------------
pause >nul
exit /b %1

REM ============================================================
REM Find Node.js and npm (handles PATH issues)
REM ============================================================
set "NODE_CMD="
set "NPM_CMD="
set "NODE_VERSION="

where node >nul 2>&1
if %errorlevel% equ 0 (
    set "NODE_CMD=node"
) else (
    if exist "%ProgramFiles%\nodejs\node.exe" set "NODE_CMD=%ProgramFiles%\nodejs\node.exe"
    if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "NODE_CMD=%ProgramFiles(x86)%\nodejs\node.exe"
    if exist "%LocalAppData%\Programs\nodejs\node.exe" set "NODE_CMD=%LocalAppData%\Programs\nodejs\node.exe"
    if exist "%ChocolateyInstall%\bin\node.exe" set "NODE_CMD=%ChocolateyInstall%\bin\node.exe"
    if exist "%SystemDrive%\ProgramData\chocolatey\bin\node.exe" set "NODE_CMD=%SystemDrive%\ProgramData\chocolatey\bin\node.exe"
)

where npm >nul 2>&1
if %errorlevel% equ 0 (
    set "NPM_CMD=npm"
) else (
    if exist "%ProgramFiles%\nodejs\npm.cmd" set "NPM_CMD=%ProgramFiles%\nodejs\npm.cmd"
    if exist "%ProgramFiles(x86)%\nodejs\npm.cmd" set "NPM_CMD=%ProgramFiles(x86)%\nodejs\npm.cmd"
    if exist "%LocalAppData%\Programs\nodejs\npm.cmd" set "NPM_CMD=%LocalAppData%\Programs\nodejs\npm.cmd"
    if exist "%ChocolateyInstall%\bin\npm.cmd" set "NPM_CMD=%ChocolateyInstall%\bin\npm.cmd"
    if exist "%SystemDrive%\ProgramData\chocolatey\bin\npm.cmd" set "NPM_CMD=%SystemDrive%\ProgramData\chocolatey\bin\npm.cmd"
)

REM ============================================================
REM Check Node.js
REM ============================================================
if not defined NODE_CMD (
    echo [ERROR] Node.js is NOT installed or not found.
    echo.
    echo  Node.js 18+ is REQUIRED to build this app.
    echo.
    echo  Would you like me to open the download page?
    echo.
    choice /C YN /M "Open Node.js download page? (Y/N): "
    if %errorlevel% equ 1 (
        start "" "https://nodejs.org/en/download/"
        echo.
        echo  Page opened in browser.
        echo  Please install Node.js (LTS version), then run this installer AGAIN.
    ) else (
        echo.
        echo  Download from: https://nodejs.org
        echo  Then run this installer again.
    )
    goto KEEP_OPEN 1
)

for /f "tokens=*" %%v in ('"%NODE_CMD%" --version') do set "NODE_VERSION=%%v"
echo [OK] Node.js found: %NODE_VERSION%
echo        Location: %NODE_CMD%
echo.

for /f "tokens=2 delims=v." %%a in ("%NODE_VERSION%") do set "NODE_MAJOR=%%a"
if %NODE_MAJOR% LSS 18 (
    echo [WARNING] Node.js %NODE_VERSION% detected. Version 18+ recommended.
    echo.
    choice /C YN /M "Continue anyway? (Y/N): "
    if %errorlevel% neq 1 goto KEEP_OPEN 1
)

REM ============================================================
REM Check npm
REM ============================================================
if not defined NPM_CMD (
    echo [ERROR] npm not found. Node.js install may be incomplete.
    echo.
    echo  Reinstall Node.js from https://nodejs.org
    echo  Make sure "npm" is checked during installation.
    goto KEEP_OPEN 1
)

for /f "tokens=*" %%v in ('"%NPM_CMD%" --version') do set "NPM_VERSION=%%v"
echo [OK] npm found: %NPM_VERSION%
echo        Location: %NPM_CMD%
echo.

REM ============================================================
REM Verify package.json exists
REM ============================================================
if not exist "package.json" (
    echo [ERROR] package.json not found!
    echo.
    echo  Run this installer from the VOICE-ASSISTANT folder
    echo  (the folder that contains package.json).
    goto KEEP_OPEN 1
)

echo [OK] Found package.json in: %CD%
echo.

REM ============================================================
REM STEP 1: Install dependencies
REM ============================================================
echo [STEP 1/3] Installing dependencies...
echo            (First run downloads ~200MB - please wait)
echo.
"%NPM_CMD%" install
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] npm install failed!
    echo.
    echo  Common fixes:
    echo   1. Check internet connection
    echo   2. Right-click this file -> "Run as administrator"
    echo   3. Temporarily disable antivirus
    echo   4. Run: "%NPM_CMD%" cache clean --force
    echo   5. Delete node_modules folder and try again
    goto KEEP_OPEN 1
)
echo.
echo [OK] Dependencies installed.
echo.

REM ============================================================
REM STEP 2: Build production app
REM ============================================================
echo [STEP 2/3] Building production app...
echo.
"%NPM_CMD%" run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed!
    echo.
    goto KEEP_OPEN 1
)
echo.
echo [OK] Build complete.
echo.

REM ============================================================
REM STEP 3: Build Windows installer
REM ============================================================
echo [STEP 3/3] Building Windows installer (.exe)...
echo            This takes 1-2 minutes...
echo.
"%NPM_CMD%" run electron:build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Electron build failed!
    echo.
    echo  Common fixes:
    echo   1. Run: "%NPM_CMD%" install --ignore-scripts
    echo   2. Delete node_modules and dist-electron folders, try again
    echo   3. Make sure you have Visual Studio Build Tools installed
    echo      (for native modules): https://visualstudio.microsoft.com/downloads/
    goto KEEP_OPEN 1
)

REM ============================================================
REM SUCCESS!
REM ============================================================
echo.
echo  ============================================================
echo   [SUCCESS] Installation Complete!
echo  ============================================================
echo.
echo  Output files are in:  dist-electron\
echo.
echo  Look for:
echo   - Voice Assistant Setup 1.0.0.exe   (full installer)
echo   - Voice Assistant-1.0.0.exe         (portable, no install)
echo.
echo  To run the app later, double-click:  RUN.bat
echo.

choice /C YN /M "Launch the app now? (Y/N): "
if %errorlevel% equ 1 (
    echo.
    echo Starting app...
    call RUN.bat
) else (
    echo.
    echo Done. Double-click RUN.bat anytime to start.
)

goto KEEP_OPEN 0