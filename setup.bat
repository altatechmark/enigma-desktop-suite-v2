@echo off
REM Enigma Desktop Suite - Setup Script
REM This script sets up the development environment for the first time

echo.
echo ========================================
echo   Enigma Desktop Suite - Setup
echo ========================================
echo.

REM Check if Python is installed
echo [1/6] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    echo.
    pause
    exit /b 1
)
python --version

REM Upgrade pip
echo.
echo [2/6] Updating pip...
python -m pip install --upgrade pip

REM Create virtual environment (optional)
echo.
echo [3/6] Creating virtual environment (optional)...
if not exist "venv" (
    python -m venv venv
    echo Virtual environment created at: venv
) else (
    echo Virtual environment already exists
)

REM Activate virtual environment
echo.
echo [4/6] Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo.
echo [5/6] Installing dependencies...
pip install -r requirements.txt

if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

REM Create required directories
echo.
echo [6/6] Creating required directories...
if not exist "uploads_excel" (
    mkdir uploads_excel
    echo Created: uploads_excel
)
if not exist "static\images" (
    mkdir static\images
    echo Created: static\images
)

echo.
echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo Next steps:
echo   1. For development: run dev_run.bat
echo   2. To build executable: run build.bat
echo   3. To run built executable: run run.bat
echo.
echo Documentation: See README.md
echo.
pause
