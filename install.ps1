<# 
.SYNOPSIS
    Voice Assistant - One-Click Installer for Windows
.DESCRIPTION
    Installs dependencies, builds the app, creates Windows installer.
    Window stays open on success or failure.
.NOTES
    Run by right-clicking install.ps1 -> "Run with PowerShell"
    Or double-click install.bat (which launches this script)
#>

param(
    [switch]$AutoLaunch
)

$ErrorActionPreference = "Stop"
$Host.UI.RawUI.WindowTitle = "Voice Assistant - Installer"
$Host.UI.RawUI.BackgroundColor = "DarkBlue"
$Host.UI.RawUI.ForegroundColor = "White"
cls

function Write-Header {
    param([string]$Text)
    Write-Host "`n============================================================" -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor Cyan
    Write-Host "============================================================`n" -ForegroundColor Cyan
}

function Write-Step {
    param([string]$Text)
    Write-Host "`n[STEP] $Text" -ForegroundColor Yellow
}

function Write-Ok {
    param([string]$Text)
    Write-Host "  [OK] $Text" -ForegroundColor Green
}

function Write-ErrorMsg {
    param([string]$Text)
    Write-Host "  [ERROR] $Text" -ForegroundColor Red
}

function Write-Info {
    param([string]$Text)
    Write-Host "  $Text" -ForegroundColor Gray
}

function Keep-Open {
    Write-Host "`n------------------------------------------------------------" -ForegroundColor Cyan
    Write-Host "Press ANY KEY to close this window..." -ForegroundColor Cyan
    Write-Host "------------------------------------------------------------" -ForegroundColor Cyan
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit $global:ExitCode
}

$global:ExitCode = 0

try {
    Write-Header "Voice Assistant - One-Click Installer for Windows"
    Write-Info "This will install dependencies, build the app, and create a Windows installer (.exe)"
    Write-Info "Estimated time: 2-5 minutes (first run downloads ~200MB)"
    Write-Info "Working folder: $PSScriptRoot"

    # ============================================================
    # STEP 0: Verify we're in the right folder
    # ============================================================
    Write-Step "Verifying project folder..."
    if (-not (Test-Path (Join-Path $PSScriptRoot "package.json"))) {
        throw "package.json not found! Run this script from the voice-assistant folder (where package.json lives)."
    }
    Write-Ok "Found package.json in $PSScriptRoot"

    # ============================================================
    # STEP 1: Find Node.js and npm
    # ============================================================
    Write-Step "Finding Node.js and npm..."
    
    $NodePaths = @(
        "node",
        "$env:ProgramFiles\nodejs\node.exe",
        "${env:ProgramFiles(x86)}\nodejs\node.exe",
        "$env:LocalAppData\Programs\nodejs\node.exe",
        "$env:ChocolateyInstall\bin\node.exe",
        "C:\ProgramData\chocolatey\bin\node.exe"
    )

    $NpmPaths = @(
        "npm",
        "$env:ProgramFiles\nodejs\npm.cmd",
        "${env:ProgramFiles(x86)}\nodejs\npm.cmd",
        "$env:LocalAppData\Programs\nodejs\npm.cmd",
        "$env:ChocolateyInstall\bin\npm.cmd",
        "C:\ProgramData\chocolatey\bin\npm.cmd"
    )

    $NodeCmd = $null
    foreach ($p in $NodePaths) {
        try {
            $v = & $p --version 2>$null
            if ($LASTEXITCODE -eq 0 -and $v) {
                $NodeCmd = $p
                $NodeVersion = $v.Trim()
                break
            }
        } catch { }
    }

    if (-not $NodeCmd) {
        Write-ErrorMsg "Node.js NOT found!"
        Write-Host "`nNode.js 18+ is REQUIRED to build this app." -ForegroundColor Red
        Write-Host "Would you like me to open the download page?" -ForegroundColor Yellow
        $choice = Read-Host "Open Node.js download page? (Y/N)"
        if ($choice -match '^[yY]') {
            Start-Process "https://nodejs.org/en/download/"
            Write-Host "Page opened. Install Node.js (LTS), then run this installer AGAIN." -ForegroundColor Cyan
        }
        throw "Node.js not installed"
    }

    Write-Ok "Node.js found: $NodeVersion at $NodeCmd"

    # Check version >= 18
    $major = [int]($NodeVersion -replace '^v(\d+).*', '$1')
    if ($major -lt 18) {
        Write-Host "`n[WARNING] Node.js $NodeVersion detected. Version 18+ recommended." -ForegroundColor Yellow
        $choice = Read-Host "Continue anyway? (Y/N)"
        if ($choice -notmatch '^[yY]') { throw "Aborted by user" }
    }

    $NpmCmd = $null
    foreach ($p in $NpmPaths) {
        try {
            $v = & $p --version 2>$null
            if ($LASTEXITCODE -eq 0 -and $v) {
                $NpmCmd = $p
                $NpmVersion = $v.Trim()
                break
            }
        } catch { }
    }

    if (-not $NpmCmd) {
        throw "npm not found (Node.js install may be incomplete)"
    }
    Write-Ok "npm found: $NpmVersion at $NpmCmd"

    # ============================================================
    # STEP 2: Install dependencies
    # ============================================================
    Write-Step "Installing dependencies (npm install)..."
    Write-Info "First run downloads ~200MB - please wait..."
    Write-Info "Running: $NpmCmd install"
    
    $result = & $NpmCmd install 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorMsg "npm install failed!"
        Write-Host $result -ForegroundColor Red
        throw "npm install failed with exit code $LASTEXITCODE"
    }
    Write-Ok "Dependencies installed"

    # ============================================================
    # STEP 3: Build production app
    # ============================================================
    Write-Step "Building production app (npm run build)..."
    Write-Info "Running: $NpmCmd run build"
    
    $result = & $NpmCmd run build 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorMsg "Build failed!"
        Write-Host $result -ForegroundColor Red
        throw "Build failed with exit code $LASTEXITCODE"
    }
    Write-Ok "Build complete"

    # ============================================================
    # STEP 4: Build Windows installer
    # ============================================================
    Write-Step "Building Windows installer (npm run electron:build)..."
    Write-Info "This takes 1-2 minutes..."
    Write-Info "Running: $NpmCmd run electron:build"
    
    $result = & $NpmCmd run electron:build 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorMsg "Electron build failed!"
        Write-Host $result -ForegroundColor Red
        Write-Host "`nCommon fixes:" -ForegroundColor Yellow
        Write-Host "  1. Run: $NpmCmd install --ignore-scripts" -ForegroundColor Gray
        Write-Host "  2. Delete node_modules and dist-electron folders, try again" -ForegroundColor Gray
        Write-Host "  3. Install Visual Studio Build Tools: https://visualstudio.microsoft.com/downloads/" -ForegroundColor Gray
        throw "Electron build failed with exit code $LASTEXITCODE"
    }
    Write-Ok "Windows installer created"

    # ============================================================
    # SUCCESS
    # ============================================================
    Write-Header "INSTALLATION COMPLETE!"
    Write-Ok "Output files are in: dist-electron\"
    Write-Info "  - Voice Assistant Setup 1.0.0.exe  (full installer)"
    Write-Info "  - Voice Assistant-1.0.0.exe        (portable, no install)"
    Write-Info "`nTo run the app later, double-click: run.bat"

    if ($AutoLaunch -or (Read-Host "`nLaunch the app now? (Y/N)") -match '^[yY]') {
        Write-Host "`nStarting app..." -ForegroundColor Cyan
        & (Join-Path $PSScriptRoot "run.bat")
    }

    $global:ExitCode = 0
}
catch {
    Write-ErrorMsg "`nINSTALLATION FAILED: $_"
    $global:ExitCode = 1
}
finally {
    Keep-Open
}