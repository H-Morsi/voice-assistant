@echo off
REM ============================================================
REM Voice Assistant - Launcher (DEBUG MODE)
REM ============================================================

echo.
echo ============================================================
echo  Voice Assistant - Launcher
echo ============================================================
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
)

if not defined APP_EXE (
    echo [ERROR] App not found!
    echo.
    echo Checked:
    echo   dist-electron\Voice Assistant-1.0.0.exe
    echo   %LOCALAPPDATA%\Voice Assistant\Voice Assistant.exe
    echo   dist-electron\Voice Assistant.exe
    echo   dist-electron\win-unpacked\Voice Assistant.exe
    echo.
    echo Run install.bat first.
    echo.
    pause
    exit /b 1
)

echo [OK] Found: %APP_EXE%
echo.
echo Launching...
start "" "%APP_EXE%"

if %errorlevel% neq 0 (
    echo [ERROR] Failed to start!
    pause
    exit /b 1
)

echo.
echo [OK] App launched. Check taskbar.
echo.
pause