@echo off
REM Enigma Desktop Suite - Development Mode
REM This script runs the application in development mode (with Python directly)

echo.
echo ========================================
echo   Enigma Desktop Suite - Dev Mode
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    echo.
    pause
    exit /b 1
)

echo [1/3] Python is installed
python --version
echo.

REM Check if dependencies are installed
echo [2/3] Checking dependencies...
pip show Flask >nul 2>&1
if errorlevel 1 (
    echo WARNING: Dependencies not found. Installing...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Run the application
echo [3/3] Starting application in development mode...
echo.
echo NOTE: 
echo   - The application will launch when Flask server starts
echo   - Ctrl+C to stop the application
echo   - Any changes to static files will require page refresh
echo   - Backend changes require restart
echo.

python app.py

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
