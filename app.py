#pyinstaller --onefile --add-data "static;static" --add-data "templates;templates" --windowed --icon=static/images/my-icon.ico --name="Enigma Desktop Suite" --uac-admin app.py

from flask import Flask, render_template, request, jsonify, redirect, url_for, session, send_file
import threading
from PyQt5.QtWidgets import QApplication, QMainWindow, QPushButton, QVBoxLayout, QHBoxLayout, QLabel, QWidget, QMessageBox
from PyQt5.QtGui import QPixmap, QDesktopServices, QCursor, QIcon
from PyQt5.QtCore import Qt, QUrl
import sys
import requests
import serial
import serial.tools.list_ports
import time

import os
import json
import shutil
from werkzeug.utils import secure_filename

import numpy as np

import cv2
import base64
from PIL import Image
from io import BytesIO
import base64
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend  # Add this import
import random
import subprocess
import datetime
import string
import socket
from werkzeug.serving import run_simple



def resource_path(relative_path):
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)
    


# Function to ensure the upload directories exist testing
def ensure_upload_folders():
    # Define the folders to check/create
    upload_folders = [
        'uploads_excel',                      # Relative path
        resource_path('static/images')        # Resource path
    ]
    


flask_app = Flask(__name__, static_folder=resource_path('static'), template_folder=resource_path('templates'))
flask_app.config['UPLOAD_FOLDER_BACKUP'] = 'instance',
flask_app.config['UPLOAD_FOLDER_EXCEL'] = 'static/uploads_excel'

flask_app.config['UPLOAD_FOLDER'] = resource_path('static/images')
flask_app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'xlsx'}
flask_app.secret_key = '1b1073f0df24befb09ac08b64c1cfe3a1aa471035043cbfd85a3e76c76d835a7'
instance_folder_path = os.path.join(flask_app.instance_path, '')

ensure_upload_folders()
uploads_excel_path = os.path.abspath('uploads_excel')
print(f"The absolute path of uploads_excel is: {uploads_excel_path}")

VIDEO_EXTENSIONS = {'.mp4', '.avi', '.mkv', '.mov', '.flv', '.webm'}
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
AUDIO_EXTENSIONS = {'.mp3', '.wav', '.ogg', '.m4a'}
DOCUMENT_EXTENSIONS = {'.pdf', '.docx', '.txt'}

#app.secret_key = 'your_secret_key'

# Base URL of your API
BASE_URL = "https://enigmakey.tech/serv"
ENDPOINT = "/login-post"
LOGIN_URL = f"{BASE_URL}{ENDPOINT}"

clipboard = {}
usbPath = ''


#kpke functions start
# Parameters
k = 10
q = 256

REQUIRED_FOLDERS = ["Movies", "Pictures", "Documents", "Music", "DCIM"]


def set_mass_storage_active():
    if 'user_data' in session:
        session['user_data']['mass_storage_activated'] = True
        return True
    return False

def set_mass_storage_deactive():
    if 'user_data' in session:
        session['user_data']['mass_storage_activated'] = False
        return True
    return False

def download_file(url, save_path, access_token):
    """Downloads a file from the given URL with authorization and saves it to the specified path."""
    headers = {"Authorization": f"Bearer {access_token}"}

    try:
        response = requests.get(url, headers=headers, stream=True)
        response.raise_for_status()  # Raise an error for unauthorized access or bad responses
        
        with open(save_path, "wb") as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)
        
        print(f"Downloaded: {save_path}")
    except requests.exceptions.RequestException as e:
        print(f"Failed to download {url}: {e}")

def ensure_required_folders(root_path):
    """
    Ensures that the required folders exist at the root level of the given path.
    """
    for folder in REQUIRED_FOLDERS:
        folder_path = os.path.join(root_path, folder)
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)  # Only create at the root


def file_to_hex(filepath):
    with open(filepath, "rb") as file:
        file_content = file.read()
    return file_content.hex()

def hex_to_vector(hex_data):
    return [int(hex_data[i:i + 2], 16) for i in range(0, len(hex_data), 2)]

def encrypt_kpke_in(file_vector, public_key):
    t = public_key['t']
    encrypted_vector = [(byte + t[i % k][0]) % q for i, byte in enumerate(file_vector)]
    return encrypted_vector

def save_encrypted_file(encrypted_data, original_filename):
    encrypted_filename = f"{original_filename}"
    with open(encrypted_filename, "wb") as encrypted_file:
        encrypted_file.write(bytes(encrypted_data))
    print(f"Encrypted file saved as: {encrypted_filename}")

# Load AES secret key
def load_secret_key_kpke(dl,uid):
    file_path = os.path.join(dl, uid+'_secret_key.bin')
    with open(file_path, 'rb') as f:
        return f.read()



def load_metadata_kpke(dl, uid):
    print("from metadata:", dl)

    # Ensure `dl` ends with a proper slash
    #if not dl.endswith(os.sep):
    #    dl += os.sep  

    file_path = os.path.join(dl, uid+'_encrypted_public_parameters.bin')

    # ✅ Convert backslashes (`\`) to forward slashes (`/`)
    file_path = file_path.replace("\\", "/")  

    if not os.path.exists(file_path):
        print(f"❌ Error: File not found -> {file_path}")
        return None  # Return None if the file is missing

    # ✅ Debugging Step: Print the correctly formatted path
    print(f"✅ Looking for file at: {file_path}")

    # Load encrypted public and private parameters
    with open(file_path, 'rb') as f:
        encrypted_public_params = f.read()

    secret_key = load_secret_key_kpke(dl, uid)

    # Decrypt the public and private parameters using the secret key
    decrypted_public_params = decrypt_parameters(encrypted_public_params, secret_key)

    # Convert decrypted data back to a dictionary
    try:
        decrypted_public_params_dict = eval(decrypted_public_params.decode('utf-8'))
        return decrypted_public_params_dict  
    except Exception as e:
        print(f"❌ Error decoding parameters: {e}")
        return None

# Decrypt parameters using AES (symmetric decryption)
def decrypt_parameters(encrypted_data, secret_key):
    encrypted_data = base64.b64decode(encrypted_data)
    iv = encrypted_data[:16]  # First 16 bytes are the IV
    encrypted_data = encrypted_data[16:]
    cipher = Cipher(algorithms.AES(secret_key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    decrypted_data = decryptor.update(encrypted_data) + decryptor.finalize()
    unpadder = padding.PKCS7(128).unpadder()
    unpadded_data = unpadder.update(decrypted_data) + unpadder.finalize()
    return unpadded_data  # Return as bytes



# Load AES secret key
def load_secret_key():
    with open('secret_key.bin', 'rb') as f:
        return f.read()




def pick_file():
    """
    Opens a file picker dialog to select a file.
    
    :return: The path to the selected file or None if no file is selected.
    """
    Tk().withdraw()  # Hide the root window
    file_path = filedialog.askopenfilename(title="Select a File")
    return file_path


def file_to_binary(file_path):
    """
    Converts a file's binary content into a binary string.
    
    :param file_path: Path to the input file.
    :return: Binary string representation of the file's content.
    """
    with open(file_path, 'rb') as file:
        binary_data = file.read()
    return ''.join(f'{byte:08b}' for byte in binary_data)  # Convert each byte to an 8-bit binary string


def add_padding(binary_data, padding):
    """
    Adds fixed padding to the binary data.
    
    :param binary_data: The original binary data.
    :param padding: The fixed padding to append in binary.
    :return: Padded binary data.
    """
    padding_binary = ''.join(f'{int(padding[i:i+2], 16):08b}' for i in range(0, len(padding), 2))
    return binary_data + padding_binary


def binary_to_vector(binary_data):
    """
    Converts binary string data to a numeric vector.
    
    :param binary_data: Binary string data.
    :return: A list of integers representing the numeric vector.
    """
    return [int(binary_data[i:i+8], 2) for i in range(0, len(binary_data), 8)]


def modify_vector(vector, multiplier, indices):
    """
    Multiplies specified indices of the vector by a given multiplier.
    
    :param vector: The numeric vector.
    :param multiplier: The multiplier to apply.
    :param indices: Indices to modify.
    :return: The modified vector.
    """
    for idx in indices:
        if idx < len(vector):  # Ensure the index is within bounds
            vector[idx] *= multiplier
    return vector


def save_binary_vector(vector, output_file):
    """
    Saves a numeric vector to a file in a binary format.
    
    :param vector: The numeric vector.
    :param output_file: Path to save the binary file.
    """
    np_vector = np.array(vector, dtype=np.uint64)  # Use 64-bit integers for large numbers
    np_vector.tofile(output_file)


def load_metadata(dl,uid):
        # Load encrypted public and private parameters

    
    file_path = os.path.join(dl, uid+'_encrypted_private_parameters.bin')

    # ✅ Convert backslashes (`\`) to forward slashes (`/`)
    file_path = file_path.replace("\\", "/")  

    if not os.path.exists(file_path):
        print(f"❌ Error: File not found -> {file_path}")
        return None  # Return None if the file is missing

    # ✅ Debugging Step: Print the correctly formatted path
    print(f"✅ Looking for file at: {file_path}")

    with open(file_path, 'rb') as f:
        encrypted_private_params = f.read()


    secret_key = load_secret_key_kpke(dl,uid)

    decrypted_private_params = decrypt_parameters(encrypted_private_params, secret_key)

    decrypted_private_params_dict = eval(decrypted_private_params.decode('utf-8'))

    return decrypted_private_params_dict


def generate_filename_from_binary(binary_content):
    """
    Generates a filename based on the binary content of the file.
    
    :param binary_content: The binary content of the file.
    :return: The filename derived from the binary content in binary format.
    """
    return ''.join(random.choice('01') for _ in range(8))  # Use the first 64 bits of the binary data for the filename




def write_metadata_to_file(file_path, metadata):
    """Append metadata to a binary file."""
    try:
        # Convert metadata to bytes and append a unique marker
        metadata_bytes = f"---META---{metadata}".encode('utf-8')
        with open(file_path, 'ab') as file:
            file.write(metadata_bytes)
        return f"Metadata '{metadata}' appended to the binary file."
    except Exception as e:
        return f"Error writing metadata: {e}"

def read_metadata_from_file(file_path):
    """Read metadata appended to a binary file."""
    try:
        with open(file_path, 'rb') as file:
            content = file.read()
        
        # Locate the metadata marker
        marker = b"---META---"
        if marker in content:
            metadata = content.split(marker)[-1].decode('utf-8')
            return metadata
        else:
            return "No metadata found in the binary file."
    except Exception as e:
        return f"Error reading metadata: {e}"

def remove_metadata_from_file(file_path):
    """Remove metadata from a binary file."""
    try:
        with open(file_path, 'rb') as file:
            content = file.read()
        
        # Locate the metadata marker
        marker = b"---META---"
        if marker in content:
            content = content.split(marker)[0]  # Keep only content before the marker
            with open(file_path, 'wb') as file:
                file.write(content)
            return "Metadata removed from the binary file."
        else:
            return "No metadata found in the binary file."
    except Exception as e:
        return f"Error removing metadata: {e}"     

def encrypt_filename(plaintext, key):
    """Encrypt plaintext using the key and encode it in a filename-safe format."""
    encrypted_bytes = bytearray()
    for i, char in enumerate(plaintext):
        # XOR each character with the corresponding character in the key
        encrypted_char = ord(char) ^ ord(key[i % len(key)])
        encrypted_bytes.append(encrypted_char)
        # Base64 encode the encrypted bytes and make it URL-safe
    return base64.urlsafe_b64encode(encrypted_bytes).decode('utf-8')
    
def decrypt_filename(ciphertext, key):
    """Decrypt the ciphertext using the key."""
    # Decode the Base64-encoded ciphertext
    encrypted_bytes = base64.urlsafe_b64decode(ciphertext.encode('utf-8'))
    
    decrypted_chars = []
    for i, byte in enumerate(encrypted_bytes):
        # Reverse the XOR operation
        decrypted_char = chr(byte ^ ord(key[i % len(key)]))
        decrypted_chars.append(decrypted_char)
    
    return ''.join(decrypted_chars)

def decrypt_directory_tree(dir_tree, key):
    """
    Recursively decrypt the 'name' field for files in the directory tree and remove '.gen' extension.
    """
    if dir_tree.get("type") == "file":
        name = dir_tree["name"]
        if name.endswith(".gen"):
            # Remove the '.gen' suffix and decrypt the remaining part
            print(name[:-4])
            decrypted_name = decrypt_filename(name[:-4], key)
            dir_tree["name"] = decrypted_name
    elif dir_tree.get("type") == "directory" and "children" in dir_tree:
        for child in dir_tree["children"]:
            decrypt_directory_tree(child, key)

def encrypt(filename, input_file, output_path):
    print(f"shane {filename}")
    #aaa = write_name_to_ads(input_file, filename)
    #print(aaa)
    #print(write_metadata_to_file(input_file, filename))
    metadata = load_metadata()
    print(f"metadata {metadata}")

    # Step 1: Convert the file to binary string
    binary_data = file_to_binary(input_file)

    # Step 2: Add padding from metadata
    padded_binary_data = add_padding(binary_data, metadata["Padding"])

    # Step 3: Convert the padded binary data to a numeric vector
    vector = binary_to_vector(padded_binary_data)

    # Step 4: Modify the vector using multiplier and indices from metadata
    multiplier = metadata["Multiplier"]
    modified_indices = metadata["Modified Indices"]
    modified_vector = modify_vector(vector, multiplier, modified_indices)
    

    # Step 5: Generate the filename based on the binary content
    #bf = generate_filename_from_binary(binary_data) + ".gen"
    kkey  = "J6E>.JVb"
    encrypted_filename = encrypt_filename(filename,kkey)
    print(f"file_name, {filename} {encrypted_filename}")
    binary_filename = output_path+str(encrypt_filename(filename,"J6E>.JVb"))+".gen"
    
    #print(f"bf {bf} output_path {output_path}")
    # Step 6: Save the modified vector as a binary file
    save_binary_vector(modified_vector, binary_filename)
    
    #bbb = write_name_to_ads(binary_filename, filename)
    #print(bbb)
    
    #print(write_metadata_to_file(binary_filename, filename))

def read_name_from_ads(file_path):
    """Read the name stored in an alternate data stream (ADS) of a file."""
    try:
        # Define the ADS stream name (appends ':name' to the original file path)
        ads_stream = f"{file_path}:name"
        
        # Check if the ADS exists
        if os.path.exists(ads_stream):
            with open(ads_stream, 'r') as ads_file:
                name = ads_file.read().strip()
            return name
        else:
            return None  # No name found in ADS

    except Exception as e:
        print(f"Error reading from ADS for file {file_path}: {e}")
        return None

import os

def read_name_from_ads(file_path):
    """Read the name stored in an alternate data stream (ADS) of a file."""
    try:
        # Define the ADS stream name (appends ':name' to the original file path)
        ads_stream = f"{file_path}:name"
        
        # Check if the ADS exists
        if os.path.exists(ads_stream):
            with open(ads_stream, 'r') as ads_file:
                name = ads_file.read().strip()
            return name if name else None  # Return the name if it's not empty
        else:
            return None  # No ADS found

    except Exception as e:
        print(f"Error reading from ADS for file {file_path}: {e}")
        return None




def decrypt(encrypted_vector, private_key):
    t = private_key['t']
    decrypted_vector = [(c - t[i % k][0]) % q for i, c in enumerate(encrypted_vector)]
    return decrypted_vector

def save_decrypted_file(decrypted_data, original_filename):
    decrypted_filename = '.'.join(original_filename.split('.')[:-1])
    with open(decrypted_filename, "wb") as decrypted_file:
        decrypted_file.write(bytes(decrypted_data))
    print(f"Decrypted file saved as: {decrypted_filename}")

def read_encrypted_file(filepath):
    with open(filepath, "rb") as file:
        return list(file.read())





def get_file_size_and_date(file_path):
    """Retrieve file size and last modified date."""
    try:
        size = os.path.getsize(file_path)
        mtime = os.path.getmtime(file_path)
        return size, datetime.fromtimestamp(mtime).strftime('%Y-%m-%d %H:%M:%S')
    except (OSError, FileNotFoundError):
        return None, None

def encode_file_to_base64(file_path):
    with open(file_path, "rb") as file:
        return base64.b64encode(file.read()).decode('utf-8')

def extract_video_thumbnail_as_base64(video_path):
    # Open the video file using OpenCV
    video_capture = cv2.VideoCapture(video_path)
    
    # Read the first frame
    ret, frame = video_capture.read()
    
    # If the frame is successfully captured, convert it to a PNG image
    if ret:
        # Convert the frame (which is in BGR format) to RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Create an image from the frame
        image = Image.fromarray(frame_rgb)
        
        # Save the image to a bytes buffer in PNG format
        buffer = BytesIO()
        image.save(buffer, format="PNG")
        buffer.seek(0)
        
        # Encode the image bytes as base64
        base64_png = base64.b64encode(buffer.read()).decode()

        return base64_png
    
    return None

def get_file_size_and_date(file_path):
    try:
        # Get file size in kilobytes
        size_kb = os.path.getsize(file_path) // 1024  # Convert bytes to KB

        # Get last modified timestamp
        timestamp = os.path.getmtime(file_path)
        mod_time = datetime.datetime.fromtimestamp(timestamp)

        # Format the datetime as per your requirement
        formatted_date = mod_time.strftime("%Y-%m-%d %I:%M %p")  # 12-hour format with AM/PM

        # Return formatted string
        return size_kb, f"{formatted_date} {size_kb}kb"
    
    except Exception as e:
        return None, f"Error: {str(e)}"

def create_dir_tree(path, exclude_dirs=None, exclude_files=None, current_path=""):
    
    if exclude_dirs is None:
        exclude_dirs = ["System Volume Information", "$RECYCLE.BIN"]
    if exclude_files is None:
        exclude_files = ["WPSettings.dat", "IndexerVolumeGuid", "directory.json"]

    


    size_kb, dateTime = get_file_size_and_date(path)
    tree = {
        "name": os.path.basename(path) or "/",
        "type": "directory",
        "category": "confidential",
        "dateTime": dateTime,
        "children": [],
        "full_path": current_path if current_path else "/"
    }

    try:
        items = os.listdir(path)
        size_kb, dateTime = get_file_size_and_date(path)
    except PermissionError:
        return {
            "name": os.path.basename(path) or "/",
            "type": "directory",
            "category": "confidential",
            "dateTime": dateTime,
            "error": "Permission denied",
            "full_path": current_path if current_path else "/"
        }

    for item in items:
        item_path = os.path.join(path, item)
        full_item_path = (current_path.rstrip("/") + "/" + item) if current_path else "/" + item

        if item in exclude_dirs or item in exclude_files:
            continue

        if os.path.isdir(item_path):
            subtree = create_dir_tree(item_path, exclude_dirs, exclude_files, full_item_path)
            tree["children"].append(subtree)
        elif os.path.isfile(item_path):
            size_kb, dateTime = get_file_size_and_date(item_path)
            item_info = {
                "name": item,
                "type": "file",
                "size": f"{size_kb} KB" if size_kb else None,
                "dateTime": dateTime,  # Updated key
                "path": full_item_path,
                "savedPath": ""
            }

            # Check if the file is an image or video
            if item.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
                item_info["thumbnail_base64"] = encode_file_to_base64(item_path)
            elif item.lower().endswith(('.mp4', '.avi', '.mkv')):
                item_info["thumbnail_base64"] = extract_video_thumbnail_as_base64(item_path)

            tree["children"].append(item_info)

    return tree
    
def update_json(path):
    dir_tree = create_dir_tree(path)
    json_path = os.path.join(path, 'directory.json')
    with open(json_path, 'w') as file:
        json.dump(dir_tree, file, indent=2)
    return dir_tree



# Function to recursively search for the matching entry in directory.json
def find_full_path_by_name(data, target_name):

    if isinstance(data, dict):
        
        if data.get("type") == "file" and data.get("name") == target_name:
            return data.get("path")
        # Recursively check in "children" if they exist
        for child in data.get("children", []):
            result = find_full_path_by_name(child, target_name)
            if result:
                return result
    elif isinstance(data, list):
        for item in data:
            result = find_full_path_by_name(item, target_name)
            if result:
                return result
    return None

def find_file_in_drives(serial_number):
    """
    Searches for a file named as 'serial_number' (without extension) in all available drives (except C).
    Returns the full path and the drive letter if found.
    """
    possible_drives = [f"{d}:\\" for d in string.ascii_uppercase if os.path.exists(f"{d}:\\") and d != 'C']

    for drive in possible_drives:
        for root, dirs, files in os.walk(drive):
            for file in files:
                if file == serial_number:  # Match file name (no extension)
                    file_path = os.path.join(root, file)  # Full path
                    drive_letter = os.path.splitdrive(file_path)[0] # Extract drive letter
                    return file_path, drive_letter  # Return both

    return None, None  # If not found


# Helper function: Get all available serial ports
def get_available_ports():
    return [port.device for port in serial.tools.list_ports.comports()]


# Helper function: Send command and wait for response
def send_command(port, command, baudrate=115200, timeout=5):
    try:
        with serial.Serial(port, baudrate=baudrate, timeout=timeout) as ser:
            time.sleep(2)
            ser.write(command.encode())
            time.sleep(1)  # Allow the device to respond
            response = ser.readline().decode().strip()
            print(response)
            return response
    except Exception as e:
        return None

def send_and_read(port, command, baudrate=115200, timeout=10):
    """
    Sends a command to the serial port and waits for the next response (e.g., UID).
    Keeps the connection open throughout the operation.
    """
    try:
        # Open the serial connection
        with serial.Serial(port, baudrate=baudrate, timeout=timeout) as ser:
            # Send the command
            ser.write(command.encode())
            time.sleep(1)  # Allow the device to process the command

            # Read the response
            response = ser.readline().decode().strip()  # Read the first response
            print(f"Response from {port}: {response}")
            
            if "AT+02=OK" in response:
                print("Fingerprint authentication activated. Waiting for UID...")

                # Wait for the next response (UID)
                uid = ser.readline().decode().strip()
                print(f"Received UID: {uid}")
                return response, uid  # Return both the initial response and UID

            return response, None  # No UID received if "AT+02=OK" is not in the response
    except Exception as e:
        print(f"Error in send_and_read on port {port}: {e}")
        return None, None

def read_from_port(port, baudrate=115200, timeout=10):
    """
    Reads the next response from the serial port.
    """
    try:
        with serial.Serial(port, baudrate=baudrate, timeout=timeout) as ser:
            # Read the next line from the port
            response = ser.readline().decode().strip()
            print(f"Received from {port}: {response}")
            return response
    except Exception as e:
        print(f"Error reading from port {port}: {e}")
        return None


# Broadcast on all ports to find the desired one
def broadcast_command():
    ports = get_available_ports()
    print(f"Available Ports: {ports}")

    for port in ports:
        response = send_command(port, "AT+00")
        if response and "AT+00=OK" in response:
            print("i am here")
            # Extract the device ID from the response (e.g., "id:0001")
            device_id = response.split("id:")[1] if "id:" in response else None
            print(device_id) 
            return {"port": port, "response": response, "device_id": device_id}
    return None



@flask_app.route('/activate-mass', methods=['GET'])
def activate_mass():
    try:
        set_mass_storage_active()
        return jsonify({'success': True})
    except Exception as e:
        print("Error in activate_mass:", e)
        return jsonify({'success': False, 'error': str(e)}), 500

#flask_app
@flask_app.route('/encrypt_aes', methods=['POST'])
def encrypt_aes():
    item_path = request.json.get("file_path")
    item_path = os.path.join(session.get('driveLetter', ''), item_path)  # Construct full file path
    print(f"Encrypting file: {item_path}")

    # Generate new encrypted file name
    new_filename = item_path + ".aes"
    print(f"Encrypted file will be saved as: {new_filename}")

    # List of extensions that should NOT be encrypted
    forbidden_extensions = ['.aes', '.rsa', '.ecc', '.kpke', '.ltm', '.tn']

    # Ensure we don't encrypt already encrypted files
    if any(item_path.endswith(ext) for ext in forbidden_extensions):
        return jsonify({'error': 'Cannot encrypt this file type'}), 400  

    # Get directory paths
    root_dir = os.path.dirname(item_path) + '/'
    filename = os.path.basename(item_path)
    dir_json_path =session.get('driveLetter')+'/directory.json'

    print(f"Root Directory: {root_dir}")
    print(f"Filename: {filename}")
    print(f"Directory JSON Path: {dir_json_path}")

    dl = session.get('driveLetter')
    session_data = session.get('user_data', {})
    print("session_data",session_data)
    uid = session_data.get("user_id")
    try:
        # Encrypt the file
        metadata = load_metadata_kpke(dl,uid)
        public_key = metadata
        hex_data = file_to_hex(item_path)
        file_vector = hex_to_vector(hex_data)
        encrypted_vector = encrypt_kpke_in(file_vector, public_key)
            
        # Save encrypted file
        save_encrypted_file(encrypted_vector, new_filename)
        print(f"File encrypted and saved as: {new_filename}") 

        # Remove the original file
        os.remove(item_path)
        print(f"Original file deleted: {item_path}")
        # Prepare data
        ledger_payload = {
            "original_file_name": filename,
            "encryption_method": "aes"
        }

        # Get access token
        access_token = session_data.get('access_token')
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        # Send API request to encrypt_ledger
        ledger_url = "https://enigmakey.tech/serv/encrypt_ledger"
        try:
            response = requests.post(ledger_url, headers=headers, json=ledger_payload)
            if response.status_code == 200:
                print("Ledger updated:", response.json())
            else:
                print("Ledger API error:", response.status_code, response.text)
        except Exception as ledger_err:
            print(f"Error calling encrypt_ledger API: {ledger_err}")

    
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({'error': str(e)}), 500

    # Update USB directory structure after encryption
    usb_path = session.get('usbPath')
    if usb_path is None:
        return jsonify({'error': 'USB path not set'}), 400

    update_json(usb_path)  # Refresh JSON with updated files
    return jsonify({'message': f'File encrypted and saved as {new_filename}'}), 200

@flask_app.route('/encrypt_rsa', methods=['POST'])
def encrypt_rsa():
    item_path = request.json.get("file_path")
    item_path = os.path.join(session.get('driveLetter', ''), item_path)  # Construct full file path
    print(f"Encrypting file: {item_path}")

    # Generate new encrypted file name
    new_filename = item_path + ".rsa"
    print(f"Encrypted file will be saved as: {new_filename}")

    # List of extensions that should NOT be encrypted
    forbidden_extensions = ['.aes', '.rsa', '.ecc', '.kpke', '.ltm', '.tn']

    # Ensure we don't encrypt already encrypted files
    if any(item_path.endswith(ext) for ext in forbidden_extensions):
        return jsonify({'error': 'Cannot encrypt this file type'}), 400  

    # Get directory paths
    root_dir = os.path.dirname(item_path) + '/'
    filename = os.path.basename(item_path)
    dir_json_path =session.get('driveLetter')+'/directory.json'

    print(f"Root Directory: {root_dir}")
    print(f"Filename: {filename}")
    print(f"Directory JSON Path: {dir_json_path}")
    session_data = session.get('user_data', {})
    uid = session_data.get("user_id")

    try:
        # Encrypt the file
        metadata = load_metadata_kpke(session.get('driveLetter'),uid)
        public_key = metadata
        hex_data = file_to_hex(item_path)
        file_vector = hex_to_vector(hex_data)
        encrypted_vector = encrypt_kpke_in(file_vector, public_key)
            
        # Save encrypted file
        save_encrypted_file(encrypted_vector, new_filename)
        print(f"File encrypted and saved as: {new_filename}") 

        # Remove the original file
        os.remove(item_path)
        print(f"Original file deleted: {item_path}")
        ledger_payload = {
            "original_file_name": filename,
            "encryption_method": "rsa"
        }

        # Get access token
        access_token = session_data.get('access_token')
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        # Send API request to encrypt_ledger
        ledger_url = "https://enigmakey.tech/serv/encrypt_ledger"
        try:
            response = requests.post(ledger_url, headers=headers, json=ledger_payload)
            if response.status_code == 200:
                print("Ledger updated:", response.json())
            else:
                print("Ledger API error:", response.status_code, response.text)
        except Exception as ledger_err:
            print(f"Error calling encrypt_ledger API: {ledger_err}")

    
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({'error': str(e)}), 500

    # Update USB directory structure after encryption
    usb_path = session.get('usbPath')
    if usb_path is None:
        return jsonify({'error': 'USB path not set'}), 400

    update_json(usb_path)  # Refresh JSON with updated files
    return jsonify({'message': f'File encrypted and saved as {new_filename}'}), 200


@flask_app.route('/decrypt', methods=['POST'])
def decrypt_a():
    try:
        data = request.get_json()
        if not data or 'file_path' not in data:
            return jsonify({"error": "Missing 'file_path' in request body"}), 400
        
        file_path = data['file_path']
        valid_extensions = (".aes", ".rsa", ".ecc", ".kpke", ".kem", ".ltm", ".tn")
        
        if not file_path.endswith(valid_extensions):
            return jsonify({"error": "Already Decrypted."}), 400
        file_path = session.get('driveLetter')+file_path
        dl = session.get('driveLetter')
        session_data = session.get('user_data', {})
        uid = session_data.get("user_id")
        private_key = load_metadata(dl,uid)
        encrypted_vector = read_encrypted_file(file_path)
        decrypted_vector = decrypt(encrypted_vector, private_key)
        output_path = save_decrypted_file(decrypted_vector, file_path)

        os.remove(file_path)

        usb_path = session.get('usbPath')
        update_json(usb_path)  # Refresh JSON with updated files
        
        # Prepare payload
        # --------------------
        # Ledger API Call
        # --------------------
        encrypted_filename = os.path.basename(file_path)
        encryption_method = encrypted_filename.split('.')[-1].lower()

        ledger_payload = {
            "encrypted_file_name": encrypted_filename,
            "encryption_method": encryption_method
        }

        access_token = session_data.get('access_token')
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        ledger_url = "https://enigmakey.tech/serv/decrypt_ledger"
        try:
            response = requests.post(ledger_url, headers=headers, json=ledger_payload)
            if response.status_code == 200:
                print("Ledger updated:", response.json())
            else:
                print("Ledger API error:", response.status_code, response.text)
        except Exception as ledger_err:
            print(f"Error calling decrypt_ledger API: {ledger_err}")


        
        return jsonify({"message": "File decrypted successfully", "decrypted_file": output_path}), 200
    
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@flask_app.route('/encrypt_ecc', methods=['POST'])
def encrypt_ecc():
    item_path = request.json.get("file_path")
    item_path = os.path.join(session.get('driveLetter', ''), item_path)  # Construct full file path
    print(f"Encrypting file: {item_path}")

    # Generate new encrypted file name
    new_filename = item_path + ".ecc"
    print(f"Encrypted file will be saved as: {new_filename}")

    # List of extensions that should NOT be encrypted
    forbidden_extensions = ['.aes', '.rsa', '.ecc', '.kpke', '.ltm', '.tn']

    # Ensure we don't encrypt already encrypted files
    if any(item_path.endswith(ext) for ext in forbidden_extensions):
        return jsonify({'error': 'Cannot encrypt this file type'}), 400  

    # Get directory paths
    root_dir = os.path.dirname(item_path) + '/'
    filename = os.path.basename(item_path)
    dir_json_path =session.get('driveLetter')+'/directory.json'

    print(f"Root Directory: {root_dir}")
    print(f"Filename: {filename}")
    print(f"Directory JSON Path: {dir_json_path}")

    session_data = session.get('user_data', {})
    uid = session_data.get("user_id")
    try:
        # Encrypt the file
        metadata = load_metadata_kpke(session.get('driveLetter'),uid)
        public_key = metadata
        hex_data = file_to_hex(item_path)
        file_vector = hex_to_vector(hex_data)
        encrypted_vector = encrypt_kpke_in(file_vector, public_key)
            
        # Save encrypted file
        save_encrypted_file(encrypted_vector, new_filename)
        print(f"File encrypted and saved as: {new_filename}") 

        # Remove the original file
        os.remove(item_path)
        print(f"Original file deleted: {item_path}")
        ledger_payload = {
            "original_file_name": filename,
            "encryption_method": "ecc"
        }

        # Get access token
        access_token = session_data.get('access_token')
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        # Send API request to encrypt_ledger
        ledger_url = "https://enigmakey.tech/serv/encrypt_ledger"
        try:
            response = requests.post(ledger_url, headers=headers, json=ledger_payload)
            if response.status_code == 200:
                print("Ledger updated:", response.json())
            else:
                print("Ledger API error:", response.status_code, response.text)
        except Exception as ledger_err:
            print(f"Error calling encrypt_ledger API: {ledger_err}")
    
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({'error': str(e)}), 500

    # Update USB directory structure after encryption
    usb_path = session.get('usbPath')
    if usb_path is None:
        return jsonify({'error': 'USB path not set'}), 400

    update_json(usb_path)  # Refresh JSON with updated files
    return jsonify({'message': f'File encrypted and saved as {new_filename}'}), 200


@flask_app.route('/encrypt_kem', methods=['POST'])
def encrypt_kem():
    item_path = request.json.get("file_path")
    item_path = os.path.join(session.get('driveLetter', ''), item_path)  # Construct full file path
    print(f"Encrypting file: {item_path}")

    # Generate new encrypted file name
    new_filename = item_path + ".kem"
    print(f"Encrypted file will be saved as: {new_filename}")

    # List of extensions that should NOT be encrypted
    forbidden_extensions = ['.aes', '.rsa', '.ecc', '.kpke', '.ltm', '.tn']

    # Ensure we don't encrypt already encrypted files
    if any(item_path.endswith(ext) for ext in forbidden_extensions):
        return jsonify({'error': 'Cannot encrypt this file type'}), 400  

    # Get directory paths
    root_dir = os.path.dirname(item_path) + '/'
    filename = os.path.basename(item_path)
    dir_json_path =session.get('driveLetter')+'/directory.json'

    print(f"Root Directory: {root_dir}")
    print(f"Filename: {filename}")
    print(f"Directory JSON Path: {dir_json_path}")
    session_data = session.get('user_data', {})
    uid = session_data.get("user_id")

    try:
        # Encrypt the file
        metadata = load_metadata_kpke(session.get('driveLetter'),uid)
        public_key = metadata
        hex_data = file_to_hex(item_path)
        file_vector = hex_to_vector(hex_data)
        encrypted_vector = encrypt_kpke_in(file_vector, public_key)
            
        # Save encrypted file
        save_encrypted_file(encrypted_vector, new_filename)
        print(f"File encrypted and saved as: {new_filename}") 

        # Remove the original file
        os.remove(item_path)
        print(f"Original file deleted: {item_path}")
        ledger_payload = {
            "original_file_name": filename,
            "encryption_method": "kem"
        }

        # Get access token
        access_token = session_data.get('access_token')
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        # Send API request to encrypt_ledger
        ledger_url = "https://enigmakey.tech/serv/encrypt_ledger"
        try:
            response = requests.post(ledger_url, headers=headers, json=ledger_payload)
            if response.status_code == 200:
                print("Ledger updated:", response.json())
            else:
                print("Ledger API error:", response.status_code, response.text)
        except Exception as ledger_err:
            print(f"Error calling encrypt_ledger API: {ledger_err}")

    
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({'error': str(e)}), 500

    # Update USB directory structure after encryption
    usb_path = session.get('usbPath')
    if usb_path is None:
        return jsonify({'error': 'USB path not set'}), 400

    update_json(usb_path)  # Refresh JSON with updated files
    return jsonify({'message': f'File encrypted and saved as {new_filename}'}), 200


@flask_app.route('/encrypt_kpke', methods=['POST'])
def encrypt_kpke():
    item_path = request.json.get("file_path")
    item_path = os.path.join(session.get('driveLetter', ''), item_path)  # Construct full file path
    print(f"Encrypting file: {item_path}")

    # Generate new encrypted file name
    new_filename = item_path + ".kpke"
    print(f"Encrypted file will be saved as: {new_filename}")

    # List of extensions that should NOT be encrypted
    forbidden_extensions = ['.aes', '.rsa', '.ecc', '.kpke', '.ltm', '.tn']

    # Ensure we don't encrypt already encrypted files
    if any(item_path.endswith(ext) for ext in forbidden_extensions):
        return jsonify({'error': 'Cannot encrypt this file type'}), 400  

    # Get directory paths
    root_dir = os.path.dirname(item_path) + '/'
    filename = os.path.basename(item_path)
    dir_json_path =session.get('driveLetter')+'/directory.json'

    print(f"Root Directory: {root_dir}")
    print(f"Filename: {filename}")
    print(f"Directory JSON Path: {dir_json_path}")

    session_data = session.get('user_data', {})
    uid = session_data.get("user_id")

    try:
        # Encrypt the file
        metadata = load_metadata_kpke(session.get('driveLetter'),uid)
        public_key = metadata
        hex_data = file_to_hex(item_path)
        file_vector = hex_to_vector(hex_data)
        encrypted_vector = encrypt_kpke_in(file_vector, public_key)
            
        # Save encrypted file
        save_encrypted_file(encrypted_vector, new_filename)
        print(f"File encrypted and saved as: {new_filename}") 

        # Remove the original file
        os.remove(item_path)
        print(f"Original file deleted: {item_path}")
        
        ledger_payload = {
            "original_file_name": filename,
            "encryption_method": "kpke"
        }

        # Get access token
        access_token = session_data.get('access_token')
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        # Send API request to encrypt_ledger
        ledger_url = "https://enigmakey.tech/serv/encrypt_ledger"
        try:
            response = requests.post(ledger_url, headers=headers, json=ledger_payload)
            if response.status_code == 200:
                print("Ledger updated:", response.json())
            else:
                print("Ledger API error:", response.status_code, response.text)
        except Exception as ledger_err:
            print(f"Error calling encrypt_ledger API: {ledger_err}")

    
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({'error': str(e)}), 500

    # Update USB directory structure after encryption
    usb_path = session.get('usbPath')
    if usb_path is None:
        return jsonify({'error': 'USB path not set'}), 400

    update_json(usb_path)  # Refresh JSON with updated files
    return jsonify({'message': f'File encrypted and saved as {new_filename}'}), 200

@flask_app.route('/encrypt_ltm', methods=['POST'])
def encrypt_ltm():
    item_path = request.json.get("file_path")
    item_path = os.path.join(session.get('driveLetter', ''), item_path)  # Construct full file path
    print(f"Encrypting file: {item_path}")

    # Generate new encrypted file name
    new_filename = item_path + ".ltm"
    print(f"Encrypted file will be saved as: {new_filename}")

    # List of extensions that should NOT be encrypted
    forbidden_extensions = ['.aes', '.rsa', '.ecc', '.kpke', '.ltm', '.tn']

    # Ensure we don't encrypt already encrypted files
    if any(item_path.endswith(ext) for ext in forbidden_extensions):
        return jsonify({'error': 'Cannot encrypt this file type'}), 400  

    # Get directory paths
    root_dir = os.path.dirname(item_path) + '/'
    filename = os.path.basename(item_path)
    dir_json_path =session.get('driveLetter')+'/directory.json'

    print(f"Root Directory: {root_dir}")
    print(f"Filename: {filename}")
    print(f"Directory JSON Path: {dir_json_path}")

    session_data = session.get('user_data', {})
    uid = session_data.get("user_id")
    try:
        # Encrypt the file
        metadata = load_metadata_kpke(session.get('driveLetter'),uid)
        public_key = metadata
        hex_data = file_to_hex(item_path)
        file_vector = hex_to_vector(hex_data)
        encrypted_vector = encrypt_kpke_in(file_vector, public_key)
            
        # Save encrypted file
        save_encrypted_file(encrypted_vector, new_filename)
        print(f"File encrypted and saved as: {new_filename}") 

        # Remove the original file
        os.remove(item_path)
        print(f"Original file deleted: {item_path}")
        ledger_payload = {
            "original_file_name": filename,
            "encryption_method": "ltm"
        }

        # Get access token
        access_token = session_data.get('access_token')
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        # Send API request to encrypt_ledger
        ledger_url = "https://enigmakey.tech/serv/encrypt_ledger"
        try:
            response = requests.post(ledger_url, headers=headers, json=ledger_payload)
            if response.status_code == 200:
                print("Ledger updated:", response.json())
            else:
                print("Ledger API error:", response.status_code, response.text)
        except Exception as ledger_err:
            print(f"Error calling encrypt_ledger API: {ledger_err}")

    
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({'error': str(e)}), 500

    # Update USB directory structure after encryption
    usb_path = session.get('usbPath')
    if usb_path is None:
        return jsonify({'error': 'USB path not set'}), 400

    update_json(usb_path)  # Refresh JSON with updated files
    return jsonify({'message': f'File encrypted and saved as {new_filename}'}), 200


@flask_app.route('/encrypt_tn', methods=['POST'])
def encrypt_tn():
    item_path = request.json.get("file_path")
    item_path = os.path.join(session.get('driveLetter', ''), item_path)  # Construct full file path
    print(f"Encrypting file: {item_path}")

    # Generate new encrypted file name
    new_filename = item_path + ".tn"
    print(f"Encrypted file will be saved as: {new_filename}")

    # List of extensions that should NOT be encrypted
    forbidden_extensions = ['.aes', '.rsa', '.ecc', '.kpke', '.ltm', '.tn']

    # Ensure we don't encrypt already encrypted files
    if any(item_path.endswith(ext) for ext in forbidden_extensions):
        return jsonify({'error': 'Cannot encrypt this file type'}), 400  

    # Get directory paths
    root_dir = os.path.dirname(item_path) + '/'
    filename = os.path.basename(item_path)
    dir_json_path =session.get('driveLetter')+'/directory.json'

    print(f"Root Directory: {root_dir}")
    print(f"Filename: {filename}")
    print(f"Directory JSON Path: {dir_json_path}")

    session_data = session.get('user_data', {})
    uid = session_data.get("user_id")
    try:
        # Encrypt the file
        metadata = load_metadata_kpke(session.get('driveLetter'),uid)
        public_key = metadata
        hex_data = file_to_hex(item_path)
        file_vector = hex_to_vector(hex_data)
        encrypted_vector = encrypt_kpke_in(file_vector, public_key)
            
        # Save encrypted file
        save_encrypted_file(encrypted_vector, new_filename)
        print(f"File encrypted and saved as: {new_filename}") 

        # Remove the original file
        os.remove(item_path)
        print(f"Original file deleted: {item_path}")
        ledger_payload = {
            "original_file_name": filename,
            "encryption_method": "tn"
        }

        # Get access token
        access_token = session_data.get('access_token')
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        # Send API request to encrypt_ledger
        ledger_url = "https://enigmakey.tech/serv/encrypt_ledger"
        try:
            response = requests.post(ledger_url, headers=headers, json=ledger_payload)
            if response.status_code == 200:
                print("Ledger updated:", response.json())
            else:
                print("Ledger API error:", response.status_code, response.text)
        except Exception as ledger_err:
            print(f"Error calling encrypt_ledger API: {ledger_err}")

    
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({'error': str(e)}), 500

    # Update USB directory structure after encryption
    usb_path = session.get('usbPath')
    if usb_path is None:
        return jsonify({'error': 'USB path not set'}), 400

    update_json(usb_path)  # Refresh JSON with updated files
    return jsonify({'message': f'File encrypted and saved as {new_filename}'}), 200




@flask_app.route('/broadcast', methods=['GET'])
def broadcast():
    # Broadcast to find the desired port
    result = broadcast_command()
    print("result",result)
    time.sleep(2)
    if result:
        # Validate the serial number in the session
        session_data = session.get('user_data', {})
        serial_number = session_data.get("serial_number")
        print("serial_number",serial_number)
        print("session_data",session_data)
        if result["device_id"] == serial_number:
            # Update the port in the session
            session["reserved_port"] = result["port"]
            print(f"Port {result['port']} reserved for further communication.")
            return jsonify({"success": True, "response": result["response"]})
        else:
            return jsonify({"success": False, "message": "HEK association with current user not found."}), 403

    return jsonify({"success": False, "message": "No desired port found."}), 404

@flask_app.route('/fingerprint-auth', methods=['GET'])
def fingerprint_auth():
    port = session.get("reserved_port")
    if not port:
        return jsonify({"success": False, "message": "No reserved port found. Please broadcast first."}), 400

    try:
        time.sleep(2)
        response, uid = send_and_read(port, "AT+02", timeout=10)

        session_data = session.get('user_data', {})
        hek_id = session_data.get('serial_number')
        access_token = session_data.get('access_token')

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        def log_fingerprint_attempt(status: str):
            ledger_payload = {
                "auth_status": status
            }
            try:
                ledger_url = "https://enigmakey.tech/serv/finger-print-authentication-ledger"
                resp = requests.post(ledger_url, headers=headers, json=ledger_payload)
                if resp.status_code == 200:
                    print(f"Fingerprint {status} logged:", resp.json())
                else:
                    print(f"Ledger API error ({status}):", resp.status_code, resp.text)
            except Exception as err:
                print(f"Ledger logging error ({status}):", err)

        if response and "AT+02=OK" in response:
            if uid and len(uid) == 6:
                if session_data.get("fingerprint_uid") == uid:
                    print(f"UID {uid} verified successfully.")
                    log_fingerprint_attempt("success")
                    return jsonify({"success": True, "uid": uid})

                else:
                    print(f"UID {uid} mismatch.")
                    log_fingerprint_attempt("failure")
                    return jsonify({"success": False, "message": "Fingerprint Mismatch."}), 403

            print("Timeout: No UID received.")
            log_fingerprint_attempt("failure")
            return jsonify({"success": False, "message": "Timeout: No UID received."}), 408

    except Exception as e:
        print(f"Error during fingerprint authentication: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

    # Final fallback case
    return jsonify({"success": False, "message": "Fingerprint authentication activation failed."}), 400

@flask_app.route('/activate-mass-storage', methods=['GET'])
def activate_mass_storage():
    # Get the reserved port from the session
    set_mass_storage_active()
    port = session.get("reserved_port")
    if not port:
        return jsonify({"success": False, "message": "No reserved port found. Please broadcast first."}), 400

    try:
        time.sleep(2)
        # Send AT+03 to activate mass storage
        response = send_command(port, "AT+03", timeout=10)
        if response and "AT+03=OK" in response:
            print("Mass storage activated successfully.")
            
            # ---------- Ledger API Call ----------
            access_token = session.get('user_data', {}).get('access_token')
            ledger_payload = {
                "device_type": "USB",
                "connection_status": "connected"
            }
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            ledger_url = "https://enigmakey.tech/serv/Device_connection_ledger"

            try:
                resp = requests.post(ledger_url, headers=headers, json=ledger_payload)
                if resp.status_code == 200:
                    print("USB connection event logged:", resp.json())
                else:
                    print("Ledger API error:", resp.status_code, resp.text)
            except Exception as ledger_err:
                print("Error calling Device_connection_ledger:", ledger_err)
            # --------------------------------------


            #session['user_data']['mass_storage_activated'] = True
            return jsonify({"success": True, "message": "Mass storage activated."})
        # If the response is not as expected
        #ession['user_data']['mass_storage_activated'] = True
        
           # ---------- Ledger API Call ----------
        access_token = session.get('user_data', {}).get('access_token')
        ledger_payload = {
            "device_type": "USB",
            "connection_status": "connected"
        }
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        ledger_url = "https://enigmakey.tech/serv/Device_connection_ledger"

        try:
            resp = requests.post(ledger_url, headers=headers, json=ledger_payload)
            if resp.status_code == 200:
                print("USB connection event logged:", resp.json())
            else:
                print("Ledger API error:", resp.status_code, resp.text)
        except Exception as ledger_err:
            print("Error calling Device_connection_ledger:", ledger_err)
            # --------------------------------------
        
        
        print(f"Unexpected response: {response}")
        return jsonify({"success": False, "message": f"Unexpected response: {response}"}), 400 ##

    except Exception as e:
        print(f"Error during mass storage activation: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@flask_app.route('/deactivate-mass-storage', methods=['POST'])
def deactivate_mass_storage():
    success = set_mass_storage_deactive()
    if success:
        return jsonify({'message': 'Mass storage deactivated successfully'}), 200
    else:
        return jsonify({'error': 'User session not found'}), 400

@flask_app.route('/get_storage_info', methods=['GET'])
def get_storage_info():
    # Get USB path from query parameter
    usb_path = session.get('usbPath')
    
    if not usb_path:
        return jsonify({'error': 'Path parameter is missing'}), 400
    
    # Check if the path exists and is a directory
    if not os.path.isdir(usb_path):
        return jsonify({'error': 'Invalid path'}), 400
    
    # Get total and used space
    total, used, free = shutil.disk_usage(usb_path)
    
    # Convert bytes to GB (you can modify to other units if necessary)
    total_gb = total // (2**30)
    used_gb = used // (2**30)
    free_gb = free // (2**30)
    
    # Return the storage information as a JSON response
    return jsonify({
        'total': total_gb,
        'used': used_gb,
        'free': free_gb
    })

@flask_app.route('/find-path', methods=['GET'])
def find_path():
    session_data = session.get('user_data', {})
    serial_number = session_data.get("serial_number")

    
    if not serial_number:
        return jsonify({"error": "Serial number is required"}), 400

    file_path, drive_letter = find_file_in_drives(serial_number)

    if file_path and drive_letter:
        session['filePath'] = file_path  # Store full path in session
        session['driveLetter'] = drive_letter  # Store drive letter in session
        return jsonify({"drive_letter": drive_letter, "file_path": file_path})
    else:
        return jsonify({"error": "File not found"}), 404


@flask_app.route('/load', methods=['GET'])
def load_directory():
    session_data = session.get('user_data', {})
    serial_number = session_data.get("serial_number")

    
    if not serial_number:
        return jsonify({"error": "Serial number is required"}), 400

    file_path, drive_letter = find_file_in_drives(serial_number)

    if file_path and drive_letter:
        session['filePath'] = file_path  # Store full path in session
        session['driveLetter'] = drive_letter  # Store drive letter in session
        
    session['user_data']['mass_storage_activated'] = True
    session_data = session.get('user_data', {})
    serial_number = session_data.get("serial_number")
    
    
    if not serial_number:
        return jsonify({"error": "Serial number is required"}), 400

    file_path, drive_letter = find_file_in_drives(serial_number)

    if file_path and drive_letter:
        session['filePath'] = file_path  # Store full path in session
        session['driveLetter'] = drive_letter  # Store drive letter in session

    usb_path = drive_letter
    access_token = session_data.get("access_token")
    if session_data.get("key_status") == "keys generated":
        for key_type in ["secret_url", "public_url", "private_url"]:
            url = session_data.get(key_type)
            if url:
                filename = os.path.basename(url)  # Extract filename from URL
                print(filename)
                filename = f"{filename}.bin"  # Ensure .bin extension
                user_id = session_data.get("user_id", "default_user")
                filename = filename.replace("fetch", user_id)
                save_path = os.path.join(usb_path, filename)
                download_file(url, save_path, access_token)

    usb_path = drive_letter #request.json.get("path", "/media/usb")
    session['usbPath'] = usb_path  # Store usbPath in session
    if not os.path.exists(usb_path):
        return jsonify({"error": "Path does not exist"}), 400

    # Key for decryption (you might fetch this from a secure source)
    decryption_key = "J6E>.JVb"

    # Check if directory.json exists in the USB path
    json_path = os.path.join(usb_path, 'directory.json')
    if os.path.exists(json_path):
        # Load existing JSON from the USB path
        with open(json_path, 'r') as file:
            dir_tree = json.load(file)
    else:
        ensure_required_folders(usb_path)
        # Crawl the USB and create JSON
        dir_tree = create_dir_tree(usb_path)

        

        # Save the directory structure as directory.json in the USB path
        with open(json_path, 'w') as file:
            json.dump(dir_tree, file, indent=2)

    # Decrypt the file names in the directory tree
    #decrypt_directory_tree(dir_tree, decryption_key)

    #print(dir_tree)
    return jsonify(dir_tree) 


@flask_app.route('/upload', methods=['POST'])
def upload_files():
    # Get the current path from the request
    current_path = request.form.get('currentPath')  # Get the current directory path from the frontend
    print(f"current_path {current_path}")
    if not current_path:
        return jsonify({'error': 'Current path not provided'}), 400

    # Ensure the path is safe and exists
    usb_path = session.get('usbPath')
    if usb_path is None:
            return jsonify({'error': 'USB path not set'}), 400
    target_path = os.path.join(usb_path, current_path)

    if not os.path.exists(target_path):
        os.makedirs(target_path)

    # Get the uploaded files
    files = request.files.getlist('files')

    if not files:
        return jsonify({'error': 'No files provided'}), 400

    # Save the files to the current directory
    for file in files:
        filename = secure_filename(file.filename)
        file_path = os.path.join(target_path, filename)
        
        try:
            print("saving")
            file.save(file_path)
            
            print(f"file_path {file_path}")
            # Exclude the file and get the directory path
            
            output_path = file_path.rsplit("/", 1)[0] + "/"
            print(f"output_path {output_path} filename {filename} *********************")  # d:/asad/
            
            #encrypt(filename,file_path,output_path)
            #os.remove(file_path)
            update_json(usb_path)
            print(f"filename {filename}  file_path {file_path}")
        except Exception as e:
            return jsonify({'error': f'Error saving file: {str(e)}'}), 500

    # After uploading, update the directory.json file (optional)
      # Call your update_json method if necessary

    return jsonify({'message': 'Files uploaded successfully'}), 200


# Serve video file
@flask_app.route('/play_video', methods=['POST'])
def play_video():
    data = request.get_json()
    video_path = data.get("video_path")
    video_path= session.get("driveLetter")+video_path
    if not video_path or not os.path.exists(video_path):
        return jsonify({"error": "Invalid or missing video path"}), 400

    if not any(video_path.lower().endswith(ext) for ext in VIDEO_EXTENSIONS):
        return jsonify({"error": "Selected file is not a valid video"}), 400

    return jsonify({"video_url": f"/stream_video?path={video_path}"})

@flask_app.route('/stream_video')
def stream_video():
    video_path = request.args.get("path")

    if not video_path or not os.path.exists(video_path):
        return "Video not found", 404

    return send_file(video_path, mimetype="video/mp4")

# Serve image file
@flask_app.route('/view_image', methods=['POST'])
def view_image():
    data = request.get_json()
    image_path = data.get("image_path")
    image_path= session.get("driveLetter")+image_path

    if not image_path or not os.path.exists(image_path):
        return jsonify({"error": "Invalid or missing image path"}), 400

    if not any(image_path.lower().endswith(ext) for ext in IMAGE_EXTENSIONS):
        return jsonify({"error": "Selected file is not an image"}), 400

    return jsonify({"image_url": f"/stream_image?path={image_path}"})

@flask_app.route('/stream_image')
def stream_image():
    image_path = request.args.get("path")

    if not image_path or not os.path.exists(image_path):
        return "Image not found", 404

    return send_file(image_path, mimetype="image/jpeg")

# Serve audio file
@flask_app.route('/play_audio', methods=['POST'])
def play_audio():
    data = request.get_json()
    audio_path = data.get("audio_path")
    audio_path= session.get("driveLetter")+audio_path

    if not audio_path or not os.path.exists(audio_path):
        return jsonify({"error": "Invalid or missing audio path"}), 400

    if not any(audio_path.lower().endswith(ext) for ext in AUDIO_EXTENSIONS):
        return jsonify({"error": "Selected file is not an audio file"}), 400

    return jsonify({"audio_url": f"/stream_audio?path={audio_path}"})

@flask_app.route('/stream_audio')
def stream_audio():
    audio_path = request.args.get("path")

    if not audio_path or not os.path.exists(audio_path):
        return "Audio not found", 404

    return send_file(audio_path, mimetype="audio/mp3")

# Serve document file
@flask_app.route('/view_document', methods=['POST'])
def view_document():
    data = request.get_json()
    document_path = data.get("document_path")
    document_path= session.get("driveLetter")+document_path

    if not document_path or not os.path.exists(document_path):
        return jsonify({"error": "Invalid or missing document path"}), 400

    if not any(document_path.lower().endswith(ext) for ext in DOCUMENT_EXTENSIONS):
        return jsonify({"error": "Selected file is not a valid document"}), 400

    return jsonify({"document_url": f"/stream_document?path={document_path}"})

@flask_app.route('/stream_document')
def stream_document():
    document_path = request.args.get("path")

    if not document_path or not os.path.exists(document_path):
        return "Document not found", 404

    return send_file(document_path, mimetype="application/pdf")


# Route for index page
@flask_app.route('/')
def index():
    return render_template('index.html')

# Route for home page
@flask_app.route('/home')
def home():
    return render_template('home.html')

# Route for sign-in page
@flask_app.route('/signin')
def signin():
    return render_template('signin.html')


    
    # Route for timeoutpage page
@flask_app.route('/timeoutpage')
def timeoutpage():
    return render_template('timeoutpage.html')

    
        # Route for help&support page
@flask_app.route('/helpsupport')
def helpsupport():
    return render_template('helpsupport.html')

            # Route for privacypolicy page
@flask_app.route('/privacypolicy')
def privacypolicy():
    return render_template('privacypolicy.html')

    
               # Route for support page
@flask_app.route('/support')
def support():
    return render_template('support.html')

                   # Route for ticket page
@flask_app.route('/ticket')
def ticket():
    return render_template('ticket.html')

# Route for login (POST)
@flask_app.route('/login', methods=['POST'])
def login():
    try:
        # Get email and password from the request
        email = request.json.get('email')
        password = request.json.get('password')
        device_type = request.json.get('device_type')

        # Prepare the payload for the API
        payload = {
            "email": email,
            "password": password,
            "device_type": device_type
        }

        # Make the POST request to the API
        response = requests.post(LOGIN_URL, json=payload)

        # Check if the request was successful
        if response.status_code == 200:
            data = response.json()
            data["mass_storage_activated"] = False
            print(data)
            session['user_data'] = data
            # Return access token and redirect URL
            return jsonify({
                "success": True,
                "access_token": data.get("access_token"),
                "redirect_url": url_for('home')
            })
        else:
            return jsonify({
                "success": False,
                "message": response.json().get("message", "Login failed")
            }), response.status_code

    except requests.exceptions.RequestException as e:
        return jsonify({"success": False, "message": str(e)}), 500

# Route to access session data (example)
@flask_app.route('/session-data', methods=['GET'])
def session_data():
    user_data = session.get('user_data', {})
    return jsonify({
        "success": True,
        "user_data": user_data
    })


# Route for bio-register page
@flask_app.route('/bioregister')
def bioregister():
    return render_template('bioregister.html')

# Route for files page
@flask_app.route('/files')
def files():
    return render_template('files.html')

# Route for forget password page
@flask_app.route('/forgetpass')
def forgetpass():
    return render_template('forgetpass.html')

# Route for OTP page
@flask_app.route('/otp')
def otp():
    return render_template('otp.html')

# Route for phone number page
@flask_app.route('/phonenum')
def phonenum():
    return render_template('phonenum.html')

    # Route for phone number page
@flask_app.route('/reset-password')
def resetpassword():
    return render_template('reset-password.html')

# Route for scan fingerprint page
@flask_app.route('/scanfingerprint')
def scanfingerprint():
    return render_template('scanfingerprint.html')


    # Route for chat page
@flask_app.route('/chat')
def chat():
    return render_template('chat.html')

      # Route for group page
@flask_app.route('/group')
def group():
    return render_template('group.html')

      # Route for call page
@flask_app.route('/call')
def call():
    return render_template('call.html')

    
    # Route for archieved page
@flask_app.route('/archieved')
def archieved():
    return render_template('archieved.html')

    
    # Route for archieved page
@flask_app.route('/notification')
def notification():
    return render_template('notification.html')

    # Route for outgoing call
@flask_app.route('/outgoing-call')
def outgoingcall():
    return render_template('outgoing-call.html')

    # Route for desktop call
@flask_app.route('/desktopCall')
def desktopCall():
    return render_template('desktopCall.html')


        # Route for images page
@flask_app.route('/images')
def images():
    return render_template('images.html')

# Route for pincode page
@flask_app.route('/pincode')
def pincode():
    return render_template('pincode.html')

# Route for createpin page
@flask_app.route('/createpin')
def createpin():
    return render_template('createpin.html')

    # Route for knotalgo page
@flask_app.route('/knotalgo')
def knotalgo():
    return render_template('knotalgo.html')

        # Route for SecuritySettings page
@flask_app.route('/SecuritySettings')
def SecuritySettings():
    return render_template('SecuritySettings.html')

        # Route for learnmore page
@flask_app.route('/learnmore')
def learnmore():
    return render_template('learnmore.html')
# @flask_app.route('/images', methods=['GET', 'POST'])
# def images():
#     if request.method == 'POST':
#         data = request.json  # JSON receive karo
#         current_user = data.get("currentUserr")
#         selected_user = data.get("selectedUserr")

#         if not current_user or not selected_user:
#             return jsonify({"error": "Missing users"}), 400

#         return render_template('images.html', currentUser=current_user, selectedUser=selected_user)


          # Route for profile page
@flask_app.route('/profile')
def profile():
    return render_template('profile.html')

          # Route for profile page
@flask_app.route('/algorithmdetail')
def algorithmdetail():
    return render_template('algorithmdetail.html')

     # Route for setting page
@flask_app.route('/setting')
def setting():
    return render_template('setting.html')

  # Route for starred page
@flask_app.route('/starredmsg')
def starredmsg():
    return render_template('starredmsg.html')

     # Route for audio call
@flask_app.route('/audiocall')
def audiocall():
    return render_template('audiocall.html')

    
     # Route for video call
@flask_app.route('/videocall')
def videocall():
    return render_template('videocall.html')

    
     # Route for decline call
@flask_app.route('/declinecall')
def declinecall():
    return render_template('declinecall.html')

@flask_app.route('/delete', methods=['POST'])
def delete_file():
    try:
        data = request.get_json()
        file_path = data.get('file_path')
        
        drive = session.get('usbPath')
        file_path = drive+file_path
        print("file_path",file_path)

        if not file_path:
            return jsonify({"error": "File path is required"}), 400

        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404

        os.remove(file_path)
        usb_root = file_path.split('/', 1)[0]  # Assuming the first part of the path is the USB root
        print("usb_root",usb_root)
        update_json(usb_root)
        
        # ------------- Call delete-file-ledger API -------------
        access_token = session.get('user_data', {}).get('access_token')
        ledger_payload = {
            "file_path": file_path  # Send the relative path as per API spec
        }

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        ledger_url = "https://enigmakey.tech/serv/delete-file-ledger"
        try:
            response = requests.post(ledger_url, headers=headers, json=ledger_payload)
            if response.status_code == 200:
                print("Ledger delete logged:", response.json())
            else:
                print("Ledger API error:", response.status_code, response.text)
        except Exception as ledger_err:
            print("Error calling delete-file-ledger:", ledger_err)
        # --------------------------------------------------------

        return jsonify({"message": f"File '{file_path}' deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
        


@flask_app.route('/usb-status', methods=['GET'])
def usb_status():
    usb_path = session.get('usbPath')
    is_connected = usb_path and os.path.exists(usb_path)

    if not is_connected:
        # ------------------- Call Ledger API -------------------
        access_token = session.get('user_data', {}).get('access_token')
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        ledger_payload = {
            "device_type": "USB",
            "connection_status": "disconnected"
        }

        ledger_url = "https://enigmakey.tech/serv/Device_connection_ledger"
        try:
            response = requests.post(ledger_url, headers=headers, json=ledger_payload)
            if response.status_code == 200:
                print("USB disconnection logged:", response.json())
            else:
                print("Ledger API error:", response.status_code, response.text)
        except Exception as ledger_err:
            print("Error calling Device_connection_ledger:", ledger_err)
        # -------------------------------------------------------

    return jsonify({'usb_connected': bool(is_connected)}), 200


@flask_app.route('/delete-folder', methods=['POST']) 
def delete_folder():
    import shutil
    try:
        data = request.get_json()
        file_path = data.get('file_path')
        
        drive = session.get('usbPath')
        file_path = drive + file_path
        print("file_path", file_path)

        if not file_path:
            return jsonify({"error": "File path is required"}), 400

        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404

        # Check if it's a directory or a file and delete accordingly
        if os.path.isdir(file_path):
            shutil.rmtree(file_path)  # ✅ Delete directory
        else:
            os.remove(file_path)      # ✅ Delete file

        usb_root = file_path.split('/', 1)[0]  # Assuming the first part is the USB root
        print("usb_root", usb_root)
        update_json(usb_root)

        return jsonify({"message": f"'{file_path}' deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@flask_app.route('/create-folder', methods=['POST'])
def create_folder():
    try:
        data = request.get_json()
        folder_name = data.get('folder_name')

        if not folder_name:
            return jsonify({"error": "Folder name is required"}), 400

        drive = session.get('usbPath')
        if not drive:
            return jsonify({"error": "USB path not found in session"}), 400

        folder_path = os.path.join(drive, folder_name)

        if os.path.exists(folder_path):
            return jsonify({"error": "Folder already exists"}), 409

        os.makedirs(folder_path)
        print("Folder created at:", folder_path)

        # USB root extraction (assuming first segment of drive is root)
        usb_root = drive.split('/', 1)[0]
        update_json(usb_root)

        return jsonify({"message": f"Folder '{folder_name}' created successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@flask_app.route('/rename', methods=['POST'])
def rename_item():
    try:
        # Extract request parameters
        item_path = request.json.get("path")
        new_name = request.json.get("new_name")
        new_filename = new_name
        drive = session.get('usbPath')
        item_path = drive+item_path
        new_name = drive+new_name
        
        key = "J6E>.JVb"  # Encryption key

        if not item_path or not new_name:
            return jsonify({'error': 'Both path and new name are required'}), 400

        # Derive the encrypted filename and ensure item_path matches it
        old_filename = os.path.basename(item_path)
        print("old_filename",old_filename)
        #encrypted_old_filename = encrypt_filename(old_filename, key) + ".gen"
        #print(encrypted_old_filename)
        #if not item_path.endswith(".gen"):
        # Adjust the item_path to match the encrypted filename
        parent_dir = os.path.dirname(item_path)
        item_path = os.path.join(parent_dir, old_filename)

        # Encrypt the new filename
        #encrypted_new_name = encrypt_filename(new_name, key) + ".gen"

        # Derive the new file path
        parent_dir = os.path.dirname(item_path)
        new_file_path = os.path.join(parent_dir, new_name)

        # Rename the file in the filesystem
        os.rename(item_path, new_file_path)

        # Call update_json with the USB root path
        usb_root = item_path.split('/', 1)[0]  # Assuming the first part of the path is the USB root
        print("usb_root",usb_root)
        update_json(usb_root)
        
        # ----------- Call rename-file-ledger API -----------
        access_token = session.get('user_data', {}).get('access_token')
        ledger_payload = {
            "old_name": old_filename,
            "new_name": new_filename
        }

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        ledger_url = "https://enigmakey.tech/serv/rename-file-ledger"
        try:
            response = requests.post(ledger_url, headers=headers, json=ledger_payload)
            if response.status_code == 200:
                print("Ledger rename logged:", response.json())
            else:
                print("Ledger API error:", response.status_code, response.text)
        except Exception as ledger_err:
            print("Error calling rename-file-ledger:", ledger_err)
        # ----------------------------------------------------

        return jsonify({
            'message': 'File renamed successfully',
            'old_path': item_path,
            'new_path': new_file_path
        }), 200

    except FileNotFoundError:
        return jsonify({'error': 'File not found. Please ensure the filename is encrypted and ends with .gen.'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


class FlaskServer(threading.Thread):
    def __init__(self, app):
        super().__init__()
        self.app = app
        self.shutdown_event = threading.Event()

    def run(self):
        def shutdown_server(signal, frame):
            self.shutdown_event.set()
            func = flask_app.funcs.get('shutdown')
            if func:
                func()

        # Run Flask server
        run_simple('0.0.0.0', 5000, self.app, use_reloader=False, use_debugger=False, threaded=True)

    def stop(self):
        # Send a shutdown request to the server
        try:
            requests.post('http://127.0.0.1:5000/shutdown')
        except requests.RequestException:
            pass


class ClickableLabel(QLabel):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setStyleSheet("color: blue; text-decoration: underline;")
        self.setTextInteractionFlags(Qt.TextSelectableByMouse | Qt.TextSelectableByKeyboard)
        self.setCursor(QCursor(Qt.IBeamCursor))  # Set cursor to I-beam for text selection

    def mouseReleaseEvent(self, event):
        if event.button() == Qt.LeftButton:
            # Open the URL if left mouse button is released
            url = self.text()
            if url.startswith("http://") or url.startswith("https://"):
                QDesktopServices.openUrl(QUrl(url))
        super().mouseReleaseEvent(event)


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Enigma Desktop App")
        self.setGeometry(100, 100, 800, 500)
        self.setFixedSize(800, 500)
        self.setWindowIcon(QIcon(resource_path('static/images/my-icon.png'))) 
        self.initUI()
        self.flask_server = None
        #self.check_nodejs_version()
        #self.run_tileserver_gl_in_background()


    def initUI(self):
        self.setStyleSheet("background-color: black;")
        central_widget = QWidget(self)
        self.setCentralWidget(central_widget)
        h_layout = QHBoxLayout(central_widget)
        left_layout = QVBoxLayout()
        self.image_label = QLabel(self)
        left_layout.addWidget(self.image_label)
        right_layout = QVBoxLayout()
        right_layout.setAlignment(Qt.AlignTop)

        # Welcome message
        self.welcome_label = QLabel("Welcome to Enigma Desktop App", self)
        self.welcome_label.setStyleSheet("font-size: 15px; font-weight: bold; color: #fff;")
        self.welcome_label.setAlignment(Qt.AlignCenter)
        right_layout.addWidget(self.welcome_label)
        
        right_layout.addSpacing(150) 
        
        
        self.start_label = QLabel("Please click Launch Server to launch the server for the application. ", self)
        self.start_label.setStyleSheet("font-size: 10px; font-weight: bold; color: #fff;")
        self.start_label.setAlignment(Qt.AlignCenter)
        right_layout.addWidget(self.start_label)
        self.start_label.show()
        
        self.stop_label = QLabel("Please click Shutdown Server to stop the server for the application. ", self)
        self.stop_label.setStyleSheet("font-size: 10px; font-weight: bold; color: #fff;")
        self.stop_label.setAlignment(Qt.AlignCenter)
        right_layout.addWidget(self.stop_label)
        self.stop_label.hide()
        
        right_layout.addSpacing(30)
        
        # Start Button
        self.start_button = QPushButton("Launch Server", self)
        self.start_button.clicked.connect(self.start_server)
        self.start_button.setStyleSheet("""
            background-color: rgb(255, 0, 0);
            color: white;
            height: 50px;
            border-radius: 10px;
            font-size: 16px;
            width:300px;
        """)
        right_layout.addWidget(self.start_button, alignment=Qt.AlignCenter)
        self.start_button.show()


        
        

        # Stop Button
        self.stop_button = QPushButton("Shutdown Server", self)
        self.stop_button.clicked.connect(self.stop_server)
        self.stop_button.setStyleSheet("""
            background-color: rgb(255, 0, 0);
            color: white;
            height: 50px;
            border-radius: 10px;
            font-size: 16px;
            width:300px;
        """)
        right_layout.addWidget(self.stop_button, alignment=Qt.AlignCenter)
        self.stop_button.setEnabled(False)
        self.stop_button.hide()
        
        right_layout.addSpacing(20)
        
        self.start_confirm = QLabel("Server is launched.", self)
        self.start_confirm.setStyleSheet("font-size: 10px; font-weight: bold; color: #fff;")
        self.start_confirm.setAlignment(Qt.AlignCenter)
        right_layout.addWidget(self.start_confirm)
        self.start_confirm.hide()

        # Server URL display
        self.url_label = ClickableLabel(self)
        right_layout.addWidget(self.url_label, alignment=Qt.AlignCenter)

        right_layout.addSpacing(200)

        self.power = QLabel("Powered by ALTA TECH MARK. ", self)
        self.power.setStyleSheet("font-size: 8px; font-weight: bold; color: #382c64;")
        self.power.setAlignment(Qt.AlignRight)
        #right_layout.addWidget(self.power)

        h_layout.addLayout(left_layout)
        h_layout.addLayout(right_layout)

    # Start the server and display the URL
    def start_server(self):
        if self.flask_server is None or not self.flask_server.is_alive():
            self.flask_server = FlaskServer(flask_app)
            self.flask_server.start()
            print("Server started")
            self.start_button.hide()
            self.stop_button.show()
            self.start_label.hide()
            self.stop_label.show()
            self.start_confirm.show()

            # Disable the Start button and enable the Stop button
            self.start_button.setEnabled(False)
            self.stop_button.setEnabled(True)

            # Get the server's IP address
            server_ip = self.get_local_ip()
            #server_url = f"http://{server_ip}:5000/"
            server_url = f"http://localhost:5000/"
            #self.url_label.setText(server_url)
            chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe" 
            custom_profile_path = r"C:\MyCustomChromeProfile"
            os.makedirs(custom_profile_path, exist_ok=True)

            url = "http://localhost:5000"

            subprocess.Popen([
                chrome_path,
                f'--user-data-dir={custom_profile_path}',
                f'--app={url}',
                '--autoplay-policy=no-user-gesture-required',
                '--enable-media-stream',
                '--disable-infobars',
                '--no-default-browser-check',

            ])

    def stop_server(self):
        func = request.environ.get('werkzeug.server.shutdown')
        if func is None:
            raise RuntimeError('Not running with the Werkzeug Server')
        func()
        print("Server stopped")

        self.start_button.setEnabled(True)
        self.stop_button.setEnabled(False)
        self.url_label.setText("")

    def closeEvent(self, event):
        self.stop_server()
        event.accept()

    def resizeEvent(self, event):
        super().resizeEvent(event)
        self.update_image_size()

    def update_image_size(self):
        pixmap = QPixmap(resource_path('static/images/bg-1.png'))
        window_width = self.width()
        window_height = self.height()
        new_height = window_height
        aspect_ratio = pixmap.width() / pixmap.height()
        new_width = int(new_height * aspect_ratio)
        if new_width > window_width // 2:
            new_width = window_width // 2
            new_height = int(new_width / aspect_ratio)
        resized_pixmap = pixmap.scaled(new_width, new_height, aspectRatioMode=1)
        self.image_label.setPixmap(resized_pixmap)
        print(f"Resized image dimensions: Width = {new_width}, Height = {new_height}")

    def get_local_ip(self):
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
            s.connect(('8.8.8.8', 1))
            ip = s.getsockname()[0]
        except Exception:
            ip = '127.0.0.1'
        finally:
            s.close()
        return ip

    def check_nodejs_version(self):
        try:
            # Check if Node.js is installed
            result = subprocess.run(['node', '-v'], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            node_version = result.stdout.decode('utf-8').strip()
            print(f"Node.js version installed: {node_version}")

            # Check Node.js version format
            if node_version.startswith('v'):
                version_parts = node_version[1:].split('.')
                major_version = int(version_parts[0])
                minor_version = int(version_parts[1])

                # Require version >= 20.16.0
                if major_version < 20 or (major_version == 20 and minor_version < 16):
                    self.show_error_message("Error: Node.js version 20.16.0 or higher is required.")
                    return  # Exit if Node.js version is insufficient

            # Specify the path to npm.cmd for Windows
            npm_path = "C:\\Program Files\\nodejs\\npm.cmd"

            # Check if npm is available
            npm_check = subprocess.run([npm_path, '-v'], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            print("npm is available")

            # Check if 'tileserver-gl' is installed globally
            tileserver_check = subprocess.run([npm_path, 'list', '-g', 'tileserver-gl'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            if "empty" in tileserver_check.stdout.decode('utf-8'):
                print("Installing tileserver-gl globally...")
                subprocess.run([npm_path, 'install', '-g', 'tileserver-gl'], check=True)
                print("tileserver-gl installed successfully.")
            else:
                print("tileserver-gl is already installed.")

            # Check if pakistan_map.zip exists
            zip_file_path = 'pakistan_map.zip'
            if os.path.exists(zip_file_path):
                print("pakistan_map.zip found, extracting...")
                with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
                    zip_ref.extractall()  # Extract contents to the current directory
                os.remove(zip_file_path)  # Delete the zip file after extraction
                print("Extraction complete and zip file removed.")
            else:
                print("pakistan_map.zip not found. Skipping extraction.")


        except FileNotFoundError:
            self.show_error_message("Error: Node.js or npm is not installed or not found in PATH.")
        except subprocess.CalledProcessError as e:
            self.show_error_message(f"An error occurred: {e}")


    def run_tileserver_gl_in_background(self):
        try:
            # Dynamically get the path to tileserver-gl
            username = os.getlogin()
            tileserver_gl_path = f"C:\\Users\\{username}\\AppData\\Roaming\\npm\\tileserver-gl.cmd"
        
            # Run tileserver-gl in the background using cmd.exe
            subprocess.Popen(['cmd.exe', '/c', tileserver_gl_path], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
            print("Started tileserver-gl in the background...")
        except FileNotFoundError:
            print("Error: tileserver-gl executable not found. Please ensure it's installed and accessible.")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")


    def show_error_message(self, message):
        msg = QMessageBox()
        msg.setIcon(QMessageBox.Critical)
        msg.setText(message)
        msg.setWindowTitle("Error")
        msg.exec_()

if __name__ == "__main__":
    # Start the PyQt5 application
    app = QApplication(sys.argv)
    main_window = MainWindow()
    main_window.show()
    sys.exit(app.exec_())