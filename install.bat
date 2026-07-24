@echo off
REM ============================================================
REM Voice Assistant - Installer Launcher
REM ============================================================
REM This runs the PowerShell installer with -NoExit so the window
REM NEVER closes, even on success or failure.
REM ============================================================

echo.
echo ============================================================
echo  Voice Assistant - Installer Launcher
echo ============================================================
echo.
echo Launching PowerShell installer (window will stay open)...
echo.

powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0install.ps1"