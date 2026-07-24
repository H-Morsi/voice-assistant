@echo off
setlocal EnableDelayedExpansion

title Voice Assistant - Launcher
color 0B
mode con: cols=80 lines=30

echo.
echo  ============================================================
echo   Voice Assistant - Launcher
echo  ============================================================
echo.

REM ============================================================
REM Helper: Keep window open on exit
REM ============================================================
:KEEP_OPEN
echo.
echo  ------------------------------------------------------------
echo  Press ANY KEY to close this window...
echo  ------------------------------------------------------------
pause >nul
exit /b %1

REM ============================================================
REM Find the built app
REM ============================================================
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

REM 3. Alternate portable name
if not defined APP_EXE (
    if exist "dist-electron\Voice Assistant.exe" (
        set "APP_EXE=dist-electron\Voice Assistant.exe"
    )
)

REM 4. Unpacked (dev) build
if not defined APP_EXE (
    if exist "dist-electron\win-unpacked\Voice Assistant.exe" (
        set "APP_EXE=dist-electron\win-unpacked\Voice Assistant.exe"
    )
)

REM 5. Check current folder (in case copied)
if not defined APP_EXE (
    if exist "Voice Assistant.exe" (
        set "APP_EXE=Voice Assistant.exe"
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
    echo   Voice Assistant.exe
    echo.
    echo Current folder: %CD%
    echo.
    choice /C YN /M "Run INSTALL.bat now? (Y/N): "
    if %errorlevel% equ 1 (
        echo.
        call INSTALL.bat
        goto :eof
    )
    goto KEEP_OPEN 1
)

echo [OK] Found app: %APP_EXE%
echo.
echo Starting Voice Assistant...
echo.

start "" "%APP_EXE%"

if %errorlevel% neq 0 (
    echo [ERROR] Failed to launch app!
    echo.
    echo Try running the exe directly:
    echo   %APP_EXE%
    goto KEEP_OPEN 1
)

echo App launched! Check your taskbar / system tray.
echo.
timeout /t 2 >nul
goto KEEP_OPEN 0