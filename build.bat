@echo off
REM Enigma Desktop Suite - Build Script
REM This script builds the application into a standalone executable

echo.
echo ========================================
echo   Enigma Desktop Suite - Build Script
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

echo [1/5] Python is installed
python --version

REM Check if pip is available
echo [2/5] Checking pip...
pip --version

REM Install/Update required packages
echo [3/5] Installing dependencies...
pip install -r requirements.txt

if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

REM Clean previous builds
echo [4/5] Cleaning previous builds...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist

REM Build the executable
echo [5/5] Building executable...
echo.
echo Running PyInstaller command...
echo.

pyinstaller --onefile ^
  --add-data "static;static" ^
  --add-data "templates;templates" ^
  --windowed ^
  --icon=static/images/my-icon.ico ^
  --name="Enigma Desktop Suite" ^
  --uac-admin ^
  app.py

if errorlevel 1 (
    echo.
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   BUILD SUCCESSFUL!
echo ========================================
echo.
echo Executable location:
echo   dist\Enigma Desktop Suite.exe
echo.
echo To run the application:
echo   1. Double-click dist\Enigma Desktop Suite.exe
echo   2. Or run: "dist\Enigma Desktop Suite.exe"
echo.
echo NOTE: Administrator rights required for execution
echo.
pause
