@echo off
REM Enigma Desktop Suite - Run Executable
REM This script runs the compiled Enigma Desktop Suite application

echo.
echo ========================================
echo   Enigma Desktop Suite - Launcher
echo ========================================
echo.

REM Check if executable exists
if not exist "dist\Enigma Desktop Suite.exe" (
    echo ERROR: Executable not found!
    echo.
    echo The application has not been built yet.
    echo Please run: build.bat
    echo.
    pause
    exit /b 1
)

echo Starting Enigma Desktop Suite...
echo.

REM Run the executable with administrator privileges
"dist\Enigma Desktop Suite.exe"

if errorlevel 1 (
    echo.
    echo ERROR: Application exited with error code %errorlevel%
    pause
    exit /b 1
)

echo.
echo Application closed successfully.
echo.
pause
