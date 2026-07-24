@echo off
setlocal EnableDelayedExpansion

title Voice Assistant - One-Click Installer
color 0A
mode con: cols=80 lines=35 lines=85

echo.
echo  ============================================================
echo   Voice Assistant - One-Click Installer for Windows
echo  ============================================================
echo.
echo  This will install Node.js dependencies, build the app,
echo  and create a Windows installer (.exe).
echo.
echo  Estimated time: 2-5 minutes (first run downloads ~200MB)
echo.

REM ------------------------------------------------------------
REM Helper: Check if command exists
REM ------------------------------------------------------------
set "NODE_CMD="
set "NPM_CMD="
set "NODE_VERSION="

REM Try to find node.exe in common locations
where node >nul 2>&1
if %errorlevel% equ 0 (
    set "NODE_CMD=node"
) else (
    REM Check common install paths
    if exist "%ProgramFiles%\nodejs\node.exe" set "NODE_CMD=%ProgramFiles%\nodejs\node.exe"
    if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "NODE_CMD=%ProgramFiles(x86)%\nodejs\node.exe"
    if exist "%LocalAppData%\Programs\nodejs\node.exe" set "NODE_CMD=%LocalAppData%\Programs\nodejs\node.exe"
    if exist "%ChocolateyInstall%\bin\node.exe" set "NODE_CMD=%ChocolateyInstall%\bin\node.exe"
    if exist "%SystemDrive%\ProgramData\chocolatey\bin\node.exe" set "NODE_CMD=%SystemDrive%\ProgramData\chocolatey\bin\node.exe"
)

REM Same for npm
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

REM ------------------------------------------------------------
REM Check Node.js
REM ------------------------------------------------------------
if not defined NODE_CMD (
    echo [ERROR] Node.js is NOT installed or not in PATH.
    echo.
    echo  Node.js 18+ is REQUIRED to build this app.
    echo.
    echo  Would you like me to open the download page for you?
    echo.
    choice /C YN /M "Open Node.js download page? (Y/N): "
    if %errorlevel% equ 1 (
        start "" "https://nodejs.org/en/download/"
        echo.
        echo  Page opened. Please install Node.js (LTS version recommended),
        echo  then run this installer again.
    ) else (
        echo.
        echo  Download Node.js from: https://nodejs.org
        echo  Then run this installer again.
    )
    echo.
    pause
    exit /b 1
)

REM Get version
for /f "tokens=*" %%v in ('"%NODE_CMD%" --version') do set "NODE_VERSION=%%v"
echo [OK] Node.js found: %NODE_VERSION%
echo        Location: %NODE_CMD%
echo.

REM Check minimum version (18+)
for /f "tokens=2 delims=v." %%a in ("%NODE_VERSION%") do set "NODE_MAJOR=%%a"
if %NODE_MAJOR% LSS 18 (
    echo [WARNING] Node.js version %NODE_VERSION% detected.
    echo           Version 18+ is recommended for best compatibility.
    echo.
    choice /C YN /M "Continue anyway? (Y/N): "
    if %errorlevel% neq 1 (
        echo Aborted.
        pause
        exit /b 1
    )
)

REM ------------------------------------------------------------
REM Check npm
REM ------------------------------------------------------------
if not defined NPM_CMD (
    echo [ERROR] npm not found. This usually means Node.js install is incomplete.
    echo.
    echo  Try reinstalling Node.js from: https://nodejs.org
    echo  Make sure to check "npm" during installation.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('"%NPM_CMD%" --version') do set "NPM_VERSION=%%v"
echo [OK] npm found: %NPM_VERSION%
echo        Location: %NPM_CMD%
echo.

REM ------------------------------------------------------------
REM Verify we're in the right directory (has package.json)
REM ------------------------------------------------------------
if not exist "package.json" (
    echo [ERROR] package.json not found!
    echo.
    echo  Please run this installer from the VOICE-ASSISTANT folder
    echo  (the folder containing package.json).
    echo.
    pause
    exit /b 1
)

echo [OK] Found package.json in current folder.
echo.

REM ------------------------------------------------------------
REM Install dependencies
REM ------------------------------------------------------------
echo [STEP 1/3] Installing dependencies...
echo            (First run downloads ~200MB - please wait)
echo.
"%NPM_CMD%" install
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] npm install failed!
    echo.
    echo  Common fixes:
    echo   - Check internet connection
    echo   - Run as Administrator (right-click -> Run as administrator)
    echo   - Temporarily disable antivirus
    echo   - Try: %NPM_CMD% cache clean --force
    echo.
    pause
    exit /b 1
)
echo.
echo [OK] Dependencies installed.
echo.

REM ------------------------------------------------------------
REM Build production app
REM ------------------------------------------------------------
echo [STEP 2/3] Building production app...
echo.
"%NPM_CMD%" run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed!
    echo.
    pause
    exit /b 1
)
echo.
echo [OK] Build complete.
echo.

REM ------------------------------------------------------------
REM Build Windows installer
REM ------------------------------------------------------------
echo [STEP 3/3] Building Windows installer (.exe)...
echo            This takes 1-2 minutes...
echo.
"%NPM_CMD%" run electron:build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Electron build failed!
    echo.
    echo  This usually means a native module failed to compile.
    echo  Try running: %NPM_CMD% install --ignore-scripts
    echo  Then run this installer again.
    echo.
    pause
    exit /b 1
)

REM ------------------------------------------------------------
REM Success!
REM ------------------------------------------------------------
echo.
echo  ============================================================
echo   [SUCCESS] Installation Complete!
echo  ============================================================
echo.
echo  Output files are in:  dist-electron\
echo.
echo  Look for:
echo   - Voice Assistant Setup 1.0.0.exe   (full installer)
echo   - Voice Assistant-1.0.0.exe         (portable, no install needed)
echo.
echo  To run the app later, just double-click:
echo   RUN.bat
echo.
echo  Or run the portable exe directly from dist-electron\
echo.

REM Auto-launch option
choice /C YN /M "Launch the app now? (Y/N): "
if %errorlevel% equ 1 (
    echo.
    echo Starting app...
    call RUN.bat
) else (
    echo.
    echo Done. Run RUN.bat anytime to start the app.
)

echo.
pause