@echo off
title Voice Assistant - Launcher
color 0B
echo.
echo  ============================================================
echo   Voice Assistant - Launcher
echo  ============================================================
echo.

REM Find the built app
set "APP_EXE="
set "INSTALLER_EXE="

REM Check for portable exe first
if exist "dist-electron\Voice Assistant-1.0.0.exe" (
    set "APP_EXE=dist-electron\Voice Assistant-1.0.0.exe"
)

REM Check for installed version (NSIS installs to AppData\Local)
if not defined APP_EXE (
    set "INSTALLED=%LOCALAPPDATA%\Voice Assistant\Voice Assistant.exe"
    if exist "%INSTALLED%" (
        set "APP_EXE=%INSTALLED%"
    )
)

REM Check for unpacked version (dev build)
if not defined APP_EXE (
    if exist "dist-electron\linux-unpacked\voice-assistant.exe" (
        set "APP_EXE=dist-electron\linux-unpacked\voice-assistant.exe"
    )
)

if not defined APP_EXE (
    echo [ERROR] Built app not found!
    echo.
    echo Please run INSTALL.bat first to build the app.
    echo.
    echo Looking for:
    echo   dist-electron\Voice Assistant-1.0.0.exe
    echo   %LOCALAPPDATA%\Voice Assistant\Voice Assistant.exe
    echo.
    pause
    exit /b 1
)

echo [OK] Found app: %APP_EXE%
echo.
echo Starting Voice Assistant...
echo.

start "" "%APP_EXE%"

echo.
echo App launched! Check your taskbar.
echo.
timeout /t 2 >nul