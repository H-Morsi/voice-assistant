@echo off
setlocal EnableDelayedExpansion

title Voice Assistant - Launcher
color 0B
mode con: cols=80 lines=25

echo.
echo  ============================================================
echo   Voice Assistant - Launcher
echo  ============================================================
echo.

set "APP_EXE="

if exist "dist-electron\Voice Assistant-1.0.0.exe" (
    set "APP_EXE=dist-electron\Voice Assistant-1.0.0.exe"
) else if exist "%LOCALAPPDATA%\Voice Assistant\Voice Assistant.exe" (
    set "APP_EXE=%LOCALAPPDATA%\Voice Assistant\Voice Assistant.exe"
) else if exist "dist-electron\Voice Assistant.exe" (
    set "APP_EXE=dist-electron\Voice Assistant.exe"
) else if exist "dist-electron\win-unpacked\Voice Assistant.exe" (
    set "APP_EXE=dist-electron\win-unpacked\Voice Assistant.exe"
) else if exist "Voice Assistant.exe" (
    set "APP_EXE=Voice Assistant.exe"
)

if not defined APP_EXE (
    echo [ERROR] App not found. Run install.bat first.
    echo.
    echo Checked:
    echo   dist-electron\Voice Assistant-1.0.0.exe
    echo   %LOCALAPPDATA%\Voice Assistant\Voice Assistant.exe
    echo.
    pause
    exit /b 1
)

echo [OK] Launching: %APP_EXE%
start "" "%APP_EXE%"
echo.
echo App started! Check taskbar.
echo.
pause