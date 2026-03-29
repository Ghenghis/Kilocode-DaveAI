@echo off
pushd %~dp0
echo --- Launching KiloCode V13 Organizer ---
where powershell >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: PowerShell was not found on this system.
    pause
    exit /b
)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Organize_V13_Pack.ps1"
echo.
echo Operation finished.
pause
popd