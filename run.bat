@echo off
REM ============================================================
REM Voice Assistant - Launcher
REM ============================================================
REM Uses PowerShell to find and launch the app.
REM Window stays open on success or failure.
REM ============================================================

echo.
echo ============================================================
echo  Voice Assistant - Launcher
echo ============================================================
echo.

powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0run.ps1"