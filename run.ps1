<# 
.SYNOPSIS
    Voice Assistant - Launcher
.DESCRIPTION
    Finds and launches the built app. Window stays open.
#>

$ErrorActionPreference = "Stop"
$Host.UI.RawUI.WindowTitle = "Voice Assistant - Launcher"
$Host.UI.RawUI.BackgroundColor = "DarkMagenta"
$Host.UI.RawUI.ForegroundColor = "White"
cls

function Keep-Open {
    Write-Host "`n------------------------------------------------------------" -ForegroundColor Magenta
    Write-Host "Press ANY KEY to close this window..." -ForegroundColor Magenta
    Write-Host "------------------------------------------------------------" -ForegroundColor Magenta
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

try {
    Write-Host "`n============================================================" -ForegroundColor Magenta
    Write-Host "  Voice Assistant - Launcher" -ForegroundColor Magenta
    Write-Host "============================================================`n" -ForegroundColor Magenta

    $ScriptDir = $PSScriptRoot
    $AppExe = $null

    # Search locations in priority order
    $SearchPaths = @(
        Join-Path $ScriptDir "dist-electron\Voice Assistant-1.0.0.exe",
        Join-Path $ScriptDir "dist-electron\Voice Assistant.exe",
        Join-Path $env:LOCALAPPDATA "Voice Assistant\Voice Assistant.exe",
        Join-Path $ScriptDir "dist-electron\win-unpacked\Voice Assistant.exe",
        Join-Path $ScriptDir "Voice Assistant.exe"
    )

    foreach ($path in $SearchPaths) {
        if (Test-Path $path) {
            $AppExe = $path
            break
        }
    }

    if (-not $AppExe) {
        Write-Host "[ERROR] Built app not found!" -ForegroundColor Red
        Write-Host "`nChecked:" -ForegroundColor Gray
        $SearchPaths | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
        Write-Host "`nCurrent folder: $ScriptDir" -ForegroundColor Gray
        
        $choice = Read-Host "`nRun installer now? (Y/N)"
        if ($choice -match '^[yY]') {
            & (Join-Path $ScriptDir "install.bat")
        }
        throw "App not found"
    }

    Write-Host "[OK] Found app: $AppExe" -ForegroundColor Green
    Write-Host "`nStarting Voice Assistant..." -ForegroundColor Cyan
    
    Start-Process -FilePath $AppExe -WorkingDirectory (Split-Path $AppExe)
    
    Write-Host "`nApp launched! Check your taskbar / system tray." -ForegroundColor Green
}
catch {
    Write-Host "`n[ERROR] $_" -ForegroundColor Red
}
finally {
    Keep-Open
}