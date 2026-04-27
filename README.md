# Enigma Desktop Suite

A comprehensive desktop application providing advanced encryption, secure communication, and file management with multiple cryptographic algorithms.

## Table of Contents

- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Key Features](#key-features)
- [Platform Architecture](#platform-architecture)
- [Project Structure](#project-structure)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Building the Application](#building-the-application)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Core Components](#core-components)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

---

## Project Overview

**Enigma Desktop Suite** is a modern desktop application that combines the power of Flask web framework with PyQt5 GUI, providing enterprise-grade encryption and secure communication capabilities. Built with Windows administration privileges, it offers multiple encryption algorithms and secure file handling for individual and organizational use.

The application integrates:
- **Backend**: Flask-based REST API server
- **Frontend**: PyQt5 desktop interface
- **Encryption**: Multiple cryptographic algorithms (AES, RSA, ECC, KEM, KPKE, LTM, TN)
- **Communication**: Real-time chat, group messaging, voice and video calls
- **File Management**: Secure file storage, media handling, and encrypted archives
- **Biometric Security**: Fingerprint authentication support

---

## Problem Statement

Modern organizations and individuals face critical data security challenges:

1. **Data Privacy**: Sensitive information needs protection from unauthorized access
2. **Secure Communication**: Chat and call data must be encrypted end-to-end
3. **File Security**: Important files need encryption with flexible access controls
4. **Multiple Encryption Standards**: Different use cases require different cryptographic approaches
5. **User Authentication**: Need for biometric and multi-factor security
6. **Portable Security**: USB-based secure storage and portable encryption
7. **Cross-Platform Communication**: Desktop application for enterprise communication

**Enigma Desktop Suite** solves these problems by providing:
- Multiple encryption algorithms for different security requirements
- Integrated communication platform with built-in security
- File encryption and secure storage management
- Biometric authentication
- USB mass storage integration
- Centralized security management interface

---

## Key Features

### Encryption & Cryptography
- **AES Encryption**: Advanced Encryption Standard for symmetric encryption
- **RSA Encryption**: Public-key cryptosystem for asymmetric encryption
- **ECC (Elliptic Curve Cryptography)**: Modern elliptic curve-based encryption
- **KEM (Key Encapsulation Mechanism)**: Key exchange protocol
- **KPKE (Key Private Key Encapsulation)**: Advanced key management
- **LTM (Lattice Main)**: Threshold-based encryption
- **TN (Torus Knot)**: Specialized encryption scheme

### Communication Features
- **Real-time Chat**: Encrypted messaging between users
- **Group Communication**: Create and manage secure group chats
- **Audio Calls**: Encrypted voice communication
- **Video Calls**: Secure video calling capabilities
- **Call Management**: Accept, decline, and manage incoming/outgoing calls
- **Message Archiving**: Save and retrieve chat history
- **Notifications**: Real-time notification system

### File Management
- **Encrypted File Storage**: Secure file upload and storage
- **Media Support**: Handle images, videos, audio, and documents
- **Directory Trees**: Organized file hierarchy visualization
- **File Encryption**: Encrypt files with multiple algorithms
- **File Decryption**: Retrieve and decrypt stored files
- **Batch Operations**: Delete and manage multiple files
- **Folder Management**: Create and organize folders

### User Management
- **User Authentication**: Secure login with API integration
- **Biometric Authentication**: Fingerprint-based authentication
- **PIN Code Protection**: Additional security layer
- **User Profiles**: User information and preferences
- **Session Management**: Multi-session support
- **Password Reset**: Secure password recovery

### Storage & Backup
- **Mass Storage Support**: USB device integration
- **Storage Information**: Monitor storage usage
- **Backup Functionality**: Create backup archives
- **Excel Export**: Export data to Excel format
- **Directory Indexing**: Create and maintain directory indices

### Security Settings
- **PIN Management**: Set and change security PIN
- **Privacy Policies**: Built-in privacy documentation
- **Security Settings**: Comprehensive security controls
- **Session Timeout**: Automatic session management
- **Password Security**: Strong password requirements

---

## Platform Architecture

### Technology Stack

```
Desktop Application (PyQt5)
        ↓
   Flask Web Server (Windows Services)
        ↓
   Static Assets (HTML/CSS/JS)
   ↓         ↓          ↓
 Encryption  File Mgmt  Communication
   Engine    System     Protocols
        ↓
   Local Database & File System
```

### Components

1. **PyQt5 Desktop GUI**
   - Main window and UI components
   - Dialog boxes and popups
   - Icon and theme management
   - Desktop notifications

2. **Flask Application (app.py)**
   - REST API endpoints
   - Request routing and handling
   - File upload/download management
   - Session management

3. **Frontend (Templates & Static)**
   - HTML templates for each page
   - CSS stylesheets for styling
   - JavaScript for client-side logic
   - Socket.IO for real-time communication

4. **Backend Services**
   - Encryption algorithms
   - File encryption/decryption
   - Metadata management
   - Directory tree creation
   - User authentication

5. **Database & Storage**
   - Local file system storage
   - Excel-based data export
   - Encrypted metadata storage
   - Session storage

---

## Project Structure

```
Enigma-Desktop-final/
├── app.py                          # Main Flask application
├── Enigma Desktop Suite.spec       # PyInstaller configuration
├── README.md                       # Project documentation
│
├── static/                         # Static assets
│   ├── authstyle/                  # CSS stylesheets
│   │   ├── style.css               # Main stylesheet
│   │   ├── chat.css                # Chat interface styles
│   │   ├── call.css                # Call interface styles
│   │   ├── desktopCall.css         # Desktop call styles
│   │   ├── videocall.css           # Video call styles
│   │   ├── group.css               # Group chat styles
│   │   ├── files.css               # File management styles
│   │   ├── images.css              # Image gallery styles
│   │   ├── profile.css             # Profile page styles
│   │   ├── setting.css             # Settings page styles
│   │   ├── SecuritySettings.css    # Security settings styles
│   │   └── [other CSS files]       # Additional stylesheets
│   │
│   ├── js/                         # JavaScript files
│   │   └── login.js                # Login logic
│   │
│   ├── mainjs/                     # Main JavaScript functionality
│   │   ├── auth.js                 # Authentication logic
│   │   ├── chat.js                 # Chat functionality
│   │   ├── call.js                 # Call handling
│   │   ├── file.js                 # File operations
│   │   ├── group.js                # Group management
│   │   ├── home.js                 # Home page logic
│   │   ├── biometric.js            # Biometric authentication
│   │   ├── event.js                # Event handling
│   │   ├── videocall.js            # Video call logic
│   │   ├── audiocall.js            # Audio call logic
│   │   └── [other JS files]        # Additional scripts
│   │
│   ├── socket/                     # Socket.IO integration
│   │   └── socket.js               # Real-time communication
│   │
│   ├── audio/                      # Audio assets
│   ├── images/                     # Image assets (excluded from doc)
│   └── chatimg/                    # Chat images (temp storage)
│
├── templates/                      # HTML templates
│   ├── index.html                  # Landing page
│   ├── signin.html                 # Sign-in page
│   ├── home.html                   # Home/dashboard page
│   ├── chat.html                   # Chat interface
│   ├── group.html                  # Group chat interface
│   ├── call.html                   # Call interface
│   ├── audiocall.html              # Audio call page
│   ├── videocall.html              # Video call page
│   ├── incoming-call.html          # Incoming call page
│   ├── outgoing-call.html          # Outgoing call page
│   ├── desktopCall.html            # Desktop call interface
│   ├── files.html                  # File management page
│   ├── images.html                 # Image gallery page
│   ├── profile.html                # User profile page
│   ├── setting.html                # Settings page
│   ├── SecuritySettings.html       # Security settings page
│   ├── pincode.html                # PIN code page
│   ├── createpin.html              # PIN creation page
│   ├── bioregister.html            # Biometric registration
│   ├── scanfingerprint.html        # Fingerprint scanning
│   ├── knotalgo.html               # Algorithm knowledge base
│   ├── learnmore.html              # Learning resources
│   ├── archieved.html              # Archived messages
│   ├── notification.html           # Notifications page
│   ├── helpsupport.html            # Help & support
│   ├── ticket.html                 # Support tickets
│   ├── privacypolicy.html          # Privacy policy
│   ├── forgetpass.html             # Forgot password
│   ├── reset-password.html         # Password reset
│   ├── otp.html                    # OTP verification
│   ├── phonenum.html               # Phone number entry
│   ├── timeoutpage.html            # Session timeout page
│   ├── create-group.html           # Create group page
│   ├── creategroup.html            # Group creation form
│   ├── next-grpage.html            # Group setup next page
│   ├── starredmsg.html             # Starred messages page
│   ├── starredgrp.html             # Starred groups page
│   ├── window-notification.html    # Window notifications
│   ├── algorithmdetail.html        # Algorithm details page
│   ├── acceptcall.html             # Accept call page
│   └── declinecall.html            # Decline call page
│
├── build/                          # PyInstaller build artifacts
│   └── Enigma Desktop Suite/       # Build directory
│
├── dist/                           # Distribution directory
│   └── Enigma Desktop Suite.exe    # Executable (after build)
│
└── uploads_excel/                  # Excel file uploads storage
```

---

## System Requirements

### Minimum Requirements
- **OS**: Windows 10 or later (64-bit)
- **RAM**: 4 GB minimum
- **Storage**: 500 MB free space
- **Python**: 3.8 or later (for development)
- **Administrator Rights**: Required for installation and execution

### Development Requirements
- Python 3.8+
- pip (Python package manager)
- Git (for version control)
- PyInstaller (for building executable)

### Optional
- Serial port device (for USB device communication)
- Biometric device (for fingerprint authentication)
- Camera (for video calling features)
- Microphone (for audio calling features)

---

## Installation

### 1. Prerequisites Installation

#### For Windows Users:
```powershell
# Install Python 3.8 or later from https://www.python.org/downloads/
# Verify installation
python --version
pip --version
```

#### Install Git (Optional, for version control):
```powershell
# Download from https://git-scm.com/download/win
```

### 2. Clone or Extract the Project

```powershell
# If using git
git clone <repository-url>
cd Enigma-Desktop-final

# Or extract the ZIP file and navigate to the directory
cd Enigma-Desktop-final
```

### 3. Create Virtual Environment (Recommended)

```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# On Command Prompt, use:
# venv\Scripts\activate.bat
```

### 4. Install Dependencies

Create a `requirements.txt` file with the following packages (if not already present):

```txt
Flask==2.3.2
Flask-CORS==4.0.0
PyQt5==5.15.7
PyQt5-sip==12.13.0
cryptography==41.0.0
opencv-python==4.8.0.76
Pillow==10.0.0
numpy==1.24.3
python-socketio==5.9.0
python-engineio==4.7.1
requests==2.31.0
Werkzeug==2.3.6
pyinstaller==5.13.0
pyserial==3.5
```

Install all dependencies:

```powershell
pip install -r requirements.txt
```

### 5. Directory Setup

Create required directories:

```powershell
# Create upload directories if they don't exist
New-Item -ItemType Directory -Force -Path "uploads_excel"
New-Item -ItemType Directory -Force -Path "static/images"
```

---

## Building the Application

### Build with PyInstaller

The PyInstaller command packages the Flask application with all dependencies into a standalone executable.

#### Build Command:

```powershell
pyinstaller --onefile `
  --add-data "static;static" `
  --add-data "templates;templates" `
  --windowed `
  --icon=static/images/my-icon.ico `
  --name="Enigma Desktop Suite" `
  --uac-admin `
  app.py
```

**Command Explanation:**
- `--onefile`: Creates a single executable file
- `--add-data "static;static"`: Includes static assets folder
- `--add-data "templates;templates"`: Includes HTML templates
- `--windowed`: No console window (GUI only)
- `--icon=static/images/my-icon.ico`: Sets application icon
- `--name="Enigma Desktop Suite"`: Sets executable name
- `--uac-admin`: Requires administrator privileges
- `app.py`: Main application file

#### Build Output:
- **Executable**: `dist/Enigma Desktop Suite.exe`
- **Build Artifacts**: `build/` directory
- **Spec File**: `Enigma Desktop Suite.spec`

#### Full Build Script (build.bat):

Create a file named `build.bat`:

```batch
@echo off
echo Building Enigma Desktop Suite...
echo.

REM Check if PyInstaller is installed
pip show pyinstaller >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing PyInstaller...
    pip install pyinstaller
)

REM Build the application
echo Building executable...
pyinstaller --onefile ^
  --add-data "static;static" ^
  --add-data "templates;templates" ^
  --windowed ^
  --icon=static/images/my-icon.ico ^
  --name="Enigma Desktop Suite" ^
  --uac-admin ^
  app.py

echo.
echo Build complete!
echo Executable location: dist/Enigma Desktop Suite.exe
pause
```

Run the build:
```powershell
.\build.bat
```

---

## Running the Application

### Development Mode

Run directly with Python:

```powershell
python app.py
```

The application will:
1. Initialize Flask web server (default port varies)
2. Launch PyQt5 desktop interface
3. Establish local WebSocket connection
4. Load all HTML/CSS/JS resources

### Production Mode

Run the compiled executable:

```powershell
# Double-click
dist/Enigma Desktop Suite.exe

# Or from PowerShell
& "dist/Enigma Desktop Suite.exe"

# Or from Command Prompt
"dist\Enigma Desktop Suite.exe"
```

### Application Startup Sequence

1. **PyQt5 Window Initialization**
   - Create main window
   - Load application icon
   - Display splash screen

2. **Flask Server Start**
   - Initialize app context
   - Create upload folders
   - Configure routes

3. **Frontend Loading**
   - Load HTML templates
   - Load CSS stylesheets
   - Load JavaScript modules
   - Initialize Socket.IO

4. **Navigation**
   - Display login page
   - Authenticate user
   - Load home dashboard
   - Initialize communication features

### CLI Startup Options

```powershell
# Run with specific host/port
python -c "from app import flask_app; flask_app.run(host='0.0.0.0', port=5000)"

# Run in debug mode (development only)
python -c "from app import flask_app; flask_app.run(debug=True)"

# Run in production mode
python -c "from werkzeug.serving import run_simple; from app import flask_app; run_simple('localhost', 5000, flask_app, use_reloader=False)"
```

---

## API Endpoints

### Authentication Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Landing page |
| `/signin` | GET | Sign-in page |
| `/login` | POST | User login |
| `/session-data` | GET | Get current session data |
| `/fingerprint-auth` | GET | Fingerprint authentication |

### Encryption Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/encrypt_aes` | POST | AES encryption |
| `/encrypt_rsa` | POST | RSA encryption |
| `/encrypt_ecc` | POST | ECC encryption |
| `/encrypt_kem` | POST | KEM encryption |
| `/encrypt_kpke` | POST | KPKE encryption |
| `/encrypt_ltm` | POST | LTM encryption |
| `/encrypt_tn` | POST | TN encryption |
| `/decrypt` | POST | Generic decryption |

### File Management Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/upload` | POST | Upload files |
| `/load` | GET | Load files from storage |
| `/play_video` | POST | Stream video file |
| `/stream_video` | GET | Video streaming |
| `/view_image` | POST | Display image |
| `/stream_image` | GET | Image streaming |
| `/play_audio` | POST | Stream audio file |
| `/stream_audio` | GET | Audio streaming |
| `/view_document` | POST | Display document |
| `/stream_document` | GET | Document streaming |
| `/delete` | POST | Delete files |
| `/delete-folder` | POST | Delete folders |
| `/create-folder` | POST | Create new folder |
| `/rename` | POST | Rename files/folders |

### Storage Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/activate-mass-storage` | GET | Activate USB storage |
| `/deactivate-mass-storage` | POST | Deactivate USB storage |
| `/get_storage_info` | GET | Get storage information |
| `/usb-status` | GET | Check USB device status |
| `/find-path` | GET | Find file path in storage |

### Communication Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/broadcast` | GET | Broadcast communication |
| `/activate-mass` | GET | Activate mass storage |

### Page Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/home` | GET | Home dashboard |
| `/chat` | GET | Chat page |
| `/group` | GET | Group chat page |
| `/call` | GET | Call interface |
| `/audiocall` | GET | Audio call page |
| `/videocall` | GET | Video call page |
| `/files` | GET | File management |
| `/images` | GET | Image gallery |
| `/profile` | GET | User profile |
| `/setting` | GET | Settings page |
| `/SecuritySettings` | GET | Security settings |
| `/pincode` | GET | PIN code page |
| `/createpin` | GET | Create PIN |
| `/bioregister` | GET | Register biometric |
| `/scanfingerprint` | GET | Fingerprint scanning |
| `/privacypolicy` | GET | Privacy policy |
| `/helpsupport` | GET | Help & support |
| `/support` | GET | Support page |
| `/ticket` | GET | Support tickets |
| `/learnmore` | GET | Learn more |
| `/knotalgo` | GET | Algorithm details |
| `/timeoutpage` | GET | Session timeout |

---

## Core Components

### 1. Main Application (app.py)

#### Key Functions:

**Resource Management**
```python
def resource_path(relative_path)
    # Determines correct path for bundled resources in PyInstaller
    # Returns path for static and template files
```

**File Encryption/Decryption**
```python
def file_to_binary(file_path)          # Convert file to binary
def file_to_hex(filepath)              # Convert file to hex
def binary_to_vector(binary_data)      # Convert to numeric vector
def add_padding(binary_data, padding)  # Add encryption padding
def modify_vector(vector, ...)         # Modify vector for encryption
def save_binary_vector(vector, ...)    # Save encrypted vector
def encrypt_filename(plaintext, key)   # Encrypt filenames
def decrypt_filename(ciphertext, key)  # Decrypt filenames
def encrypt(filename, input_file, ...)  # Main encryption function
def decrypt(encrypted_vector, ...)     # Main decryption function
```

**Metadata Management**
```python
def load_metadata(dl, uid)             # Load encryption metadata
def load_metadata_kpke(dl, uid)        # Load KPKE metadata
def load_secret_key_kpke(dl, uid)      # Load secret keys
def decrypt_parameters(enc_data, key)  # Decrypt parameters
```

**Directory Management**
```python
def create_dir_tree(path, ...)         # Create directory tree structure
def update_json(path)                  # Update directory JSON
def find_full_path_by_name(data, ...)  # Search for files by name
def find_file_in_drives(serial_number) # Find files in drives
def ensure_required_folders(root_path) # Ensure folder structure
```

**Media Handling**
```python
def encode_file_to_base64(file_path)   # Encode files to base64
def extract_video_thumbnail_as_base64  # Extract video thumbnails
def get_file_size_and_date(file_path)  # Get file metadata
```

**Serial Communication**
```python
def get_available_ports()              # List serial ports
def send_command(port, command, ...)   # Send serial commands
def send_and_read(port, command, ...)  # Send and read response
def read_from_port(port, ...)          # Read serial data
def broadcast_command()                # Broadcast on all ports
```

#### Configuration:

```python
# Flask Configuration
BASE_URL = "https://enigmakey.tech/serv"
LOGIN_URL = f"{BASE_URL}/login-post"

# File Extensions
VIDEO_EXTENSIONS = {'.mp4', '.avi', '.mkv', '.mov', '.flv', '.webm'}
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
AUDIO_EXTENSIONS = {'.mp3', '.wav', '.ogg', '.m4a'}
DOCUMENT_EXTENSIONS = {'.pdf', '.docx', '.txt'}

# Encryption Parameters
k = 10  # Key parameter
q = 256  # Modulus

# Required Folders
REQUIRED_FOLDERS = ["Movies", "Pictures", "Documents", "Music", "DCIM"]
```

### 2. PyQt5 Desktop Interface

#### Main Components:

**FlaskServer Class**
- Runs Flask server in separate thread
- Manages server lifecycle
- Handles thread synchronization

**MainWindow Class**
- Primary PyQt5 application window
- Manages desktop UI
- Handles user interactions
- Displays web content via QWebEngine or similar
- Manages application lifecycle

**ClickableLabel Class**
- Custom clickable label widget
- Handles label click events
- Used for interactive UI elements

### 3. Frontend Components

#### Static Assets (static/)

**Stylesheets (authstyle/)**
- `style.css` - Main application styles
- `chat.css` - Chat interface
- `call.css` - Call interface
- `videocall.css` - Video call styling
- `group.css` - Group chat
- `files.css` - File management
- `profile.css` - User profile
- `setting.css` - Settings page
- `SecuritySettings.css` - Security settings
- And 20+ additional stylesheets

**JavaScript (mainjs/)**
- `auth.js` - Authentication logic
- `chat.js` - Chat functionality
- `call.js` - Call handling
- `file.js` - File operations
- `group.js` - Group management
- `biometric.js` - Biometric features
- `videocall.js`, `audiocall.js` - Call features
- Socket initialization and event handling

**Socket.IO (socket/)**
- `socket.js` - Real-time communication
- WebSocket connection management
- Message broadcasting

#### HTML Templates (templates/)

**Authentication Pages**
- `index.html` - Landing page
- `signin.html` - Sign-in interface
- `bioregister.html` - Biometric registration
- `scanfingerprint.html` - Fingerprint scanning
- `pincode.html`, `createpin.html` - PIN management

**Communication Pages**
- `chat.html` - One-on-one chat
- `group.html`, `creategroup.html` - Group messaging
- `call.html`, `call1.html` - Call interfaces
- `audiocall.html`, `videocall.html` - Audio/video calls
- `incoming-call.html`, `outgoing-call.html` - Call states
- `desktopCall.html` - Desktop call interface

**File Management**
- `files.html` - File browser
- `images.html` - Image gallery
- `create-group.html` - Group file sharing

**User Features**
- `home.html` - Dashboard
- `profile.html` - User profile
- `setting.html` - Settings
- `SecuritySettings.html` - Security options
- `archieved.html` - Archived messages
- `notification.html` - Notifications
- `starredmsg.html`, `starredgrp.html` - Starred items

**Information Pages**
- `helpsupport.html` - Help center
- `ticket.html` - Support tickets
- `privacypolicy.html` - Privacy policy
- `knotalgo.html` - Algorithm information
- `learnmore.html` - Learning resources

**Error & Session Pages**
- `timeoutpage.html` - Session timeout
- `forgetpass.html`, `reset-password.html` - Password recovery
- `otp.html` - OTP verification
- `phonenum.html` - Phone number entry

---

## Configuration

### Flask Configuration (app.py)

```python
# Flask Application Setup
flask_app = Flask(
    __name__,
    static_folder=resource_path('static'),
    template_folder=resource_path('templates')
)

# Upload Configuration
flask_app.config['UPLOAD_FOLDER'] = resource_path('static/images')
flask_app.config['UPLOAD_FOLDER_EXCEL'] = 'static/uploads_excel'
flask_app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'xlsx'}
flask_app.secret_key = '1b1073f0df24befb09ac08b64c1cfe3a1aa471035043cbfd85a3e76c76d835a7'
```

### PyInstaller Configuration (Enigma Desktop Suite.spec)

```python
a = Analysis(
    ['app.py'],
    datas=[('static', 'static'), ('templates', 'templates')],
)

exe = EXE(
    ...,
    name='Enigma Desktop Suite',
    console=False,  # No console window
    uac_admin=True,  # Requires admin rights
    icon=['static\\images\\my-icon.ico'],
)
```

### API Configuration

```python
# API Endpoint
BASE_URL = "https://enigmakey.tech/serv"
ENDPOINT = "/login-post"
LOGIN_URL = f"{BASE_URL}{ENDPOINT}"
```

### File Type Configuration

```python
VIDEO_EXTENSIONS = {'.mp4', '.avi', '.mkv', '.mov', '.flv', '.webm'}
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
AUDIO_EXTENSIONS = {'.mp3', '.wav', '.ogg', '.m4a'}
DOCUMENT_EXTENSIONS = {'.pdf', '.docx', '.txt'}
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. **PyInstaller Build Fails**

**Problem**: Build command fails with dependency errors

**Solutions**:
```powershell
# Update PyInstaller
pip install --upgrade pyinstaller

# Install missing dependencies
pip install -r requirements.txt

# Clean previous builds
Remove-Item -Recurse build/
Remove-Item -Recurse dist/
```

#### 2. **Missing Static Files or Templates**

**Problem**: Application runs but CSS/JS/images not loading

**Solutions**:
```powershell
# Verify directories exist
Test-Path "static/"
Test-Path "templates/"

# Update PyInstaller command to include data
pyinstaller --add-data "static;static" --add-data "templates;templates" ...

# Ensure resource_path() is correctly implemented in app.py
```

#### 3. **Port Already in Use**

**Problem**: "Address already in use" error

**Solutions**:
```powershell
# Find process using port
netstat -ano | findstr :5000

# Kill the process (Windows)
taskkill /PID <PID> /F

# Use different port
python -c "from app import flask_app; flask_app.run(port=5001)"
```

#### 4. **Permission Denied Errors**

**Problem**: Application can't write to directories

**Solutions**:
```powershell
# Run as Administrator
# Right-click executable → Run as administrator

# Or use UAC Admin in PyInstaller (already configured)
pyinstaller ... --uac-admin ...
```

#### 5. **Biometric Device Not Found**

**Problem**: Fingerprint scanner not recognized

**Solutions**:
- Check device drivers installed
- Verify device is connected
- Test device with manufacturer software first
- Ensure USB permissions are granted

#### 6. **Video/Audio Issues**

**Problem**: Video or audio not playing

**Solutions**:
```powershell
# Install OpenCV
pip install opencv-python

# Verify camera/microphone in device settings
# Check browser console for WebRTC errors
```

#### 7. **SSL Certificate Errors**

**Problem**: HTTPS connection fails to enigmakey.tech

**Solutions**:
```powershell
# Install SSL certificates
# Disable SSL verification (development only):
import requests
requests.packages.urllib3.disable_warnings()
```

#### 8. **Database/Session Errors**

**Problem**: Session data not persisting

**Solutions**:
```python
# Ensure session folder exists
New-Item -ItemType Directory -Path "instance"

# Check Flask session configuration
# Verify secret_key is set correctly
```

---

## Development Workflow

### 1. Setting Up Development Environment

```powershell
# Clone repository
git clone <repo-url>
cd Enigma-Desktop-final

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create required directories
New-Item -ItemType Directory -Force -Path "uploads_excel"
New-Item -ItemType Directory -Force -Path "static/images"
```

### 2. Development Mode Execution

```powershell
# Run with debugging
python app.py

# The application will launch with:
# - Flask server running
# - Hot reload disabled (for stability)
# - Console output for debugging
```

### 3. Making Changes

**Backend Changes (app.py)**:
- Stop the application
- Edit app.py
- Restart application

**Frontend Changes (templates/static)**:
- Changes to HTML/CSS/JS take effect after page refresh
- No restart needed

**Testing**:
```powershell
# Test specific routes
curl http://localhost:5000/

# Test API endpoints
curl -X POST http://localhost:5000/login -d "{...}"

# Check logs in console
```

### 4. Building Release Version

```powershell
# Ensure all dependencies installed
pip install -r requirements.txt

# Clean previous builds
Remove-Item -Recurse build/
Remove-Item -Recurse dist/

# Build executable
.\build.bat

# Test executable
& "dist/Enigma Desktop Suite.exe"
```

---

## Performance Optimization

### For Large Files

```python
# Use streaming for video/audio files
# Implemented in /stream_video, /stream_audio routes
# Chunks of 8192 bytes for memory efficiency
```

### For Encryption

```python
# Large file encryption uses vector-based approach
# Processes file in chunks to manage memory
# Supports multiple encryption algorithms for flexibility
```

### For UI Responsiveness

```javascript
// Use async operations for file uploads
// Implement progress bars for long operations
// Use Web Workers for heavy computations
```

---

## Security Considerations

### Best Practices

1. **Secret Key**: Change the Flask secret key in production
   ```python
   # Current: '1b1073f0df24befb09ac08b64c1cfe3a1aa471035043cbfd85a3e76c76d835a7'
   # Generate new: python -c "import secrets; print(secrets.token_hex(32))"
   ```

2. **HTTPS**: Use HTTPS for all communications
   ```python
   # The app connects to https://enigmakey.tech/serv
   ```

3. **File Uploads**: Validate file types and sizes
   ```python
   # Allowed extensions configured
   # Implement file size limits
   ```

4. **Authentication**: Use strong passwords
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, special chars
   - No common dictionary words

5. **Biometric Security**: Secure fingerprint data
   - Stored encrypted
   - Never transmitted in plain text
   - Regular authentication attempts logged

---

## License

[Specify your license here - e.g., MIT, GPL, Commercial, etc.]

---

## Support

For issues, feature requests, or questions:

1. **Help & Support**: Visit `/helpsupport` page in application
2. **Support Tickets**: Create ticket via `/ticket` endpoint
3. **Privacy Policy**: Review at `/privacypolicy`

---

## Changelog

### Version 1.0.0
- Initial release
- Multiple encryption algorithms
- Chat and calling features
- File management system
- Biometric authentication
- USB storage integration

---

## Contact & Contribution

**Project URL**: https://enigmakey.tech/

For contribution guidelines, please refer to CONTRIBUTING.md

---

**Last Updated**: April 2026

**Maintained By**: Enigma Desktop Suite Development Team

