@echo off
setlocal EnableDelayedExpansion

title Voice Assistant - Launcher
color 0B
mode con: cols=70 lines=25

echo.
echo  ============================================================
echo   Voice Assistant - Launcher
echo  ============================================================
echo.

REM ------------------------------------------------------------
REM Find the built app (portable exe preferred, then installed)
REM ------------------------------------------------------------
set "APP_EXE="

REM 1. Portable exe from electron-builder (NSIS)
if exist "dist-electron\Voice Assistant-1.0.0.exe" (
    set "APP_EXE=dist-electron\Voice Assistant-1.0.0.exe"
)

REM 2. Installed version (NSIS default install location)
if not defined APP_EXE (
    set "INSTALLED=%LOCALAPPDATA%\Voice Assistant\Voice Assistant.exe"
    if exist "%INSTALLED%" (
        set "APP_EXE=%INSTALLED%"
    )
)

REM 3. Portable from different electron-builder config
if not defined APP_EXE (
    if exist "dist-electron\Voice Assistant.exe" (
        set "APP_EXE=dist-electron\Voice Assistant.exe"
    )
)

REM 4. Check for unpacked (dev) build
if not defined APP_EXE (
    if exist "dist-electron\win-unpacked\Voice Assistant.exe" (
        set "APP_EXE=dist-electron\win-unpacked\Voice Assistant.exe"
    )
)

REM 5. Linux build fallback (shouldn't happen on Windows)
if not defined APP_EXE (
    if exist "dist-electron\linux-unpacked\voice-assistant" (
        set "APP_EXE=dist-electron\linux-unpacked\voice-assistant"
    )
)

if not defined APP_EXE (
    echo [ERROR] Built app not found!
    echo.
    echo Please run INSTALL.bat first to build the application.
    echo.
    echo Expected locations checked:
    echo   dist-electron\Voice Assistant-1.0.0.exe
    echo   dist-electron\Voice Assistant.exe
    echo   %LOCALAPPDATA%\Voice Assistant\Voice Assistant.exe
    echo   dist-electron\win-unpacked\Voice Assistant.exe
    echo.
    echo Current folder: %CD%
    echo.
    choice /C YN /M "Run INSTALL.bat now? (Y/N): "
    if %errorlevel% equ 1 (
        echo.
        call INSTALL.bat
        goto :eof
    )
    pause
    exit /b 1
)

echo [OK] Found app: %APP_EXE%
echo.
echo Starting Voice Assistant...
echo.

start "" "%APP_EXE%"

echo App launched! Check your taskbar / system tray.
echo.
timeout /t 2 >nul