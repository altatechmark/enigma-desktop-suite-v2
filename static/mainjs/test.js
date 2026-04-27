document.addEventListener("DOMContentLoaded", function () {
    const loadFilesButton = document.querySelector(".load-files-button");
    const icon = document.querySelector(".no-files-container .icon img");
    const message = document.querySelector(".no-files-container .message");

    loadFilesButton.addEventListener("click", async function () {
        try {
            loadFilesButton.style.display = "none"; 
            icon.src = "static/images/loader2.gif";
            icon.style.width = "350px";
            icon.style.height = "350px";
            icon.style.objectFit = "contain";
            message.textContent = "...";

            // Step 1: Broadcast to find the USB port
            const broadcastResponse = await fetch("/broadcast");
            const broadcastData = await broadcastResponse.json();

            if (!broadcastData.success) {
                icon.src = "static/images/dataNotFound2.png";
                icon.style.width = "100px";
                icon.style.height = "100px";
                icon.style.objectFit = "contain";
                message.textContent = "HEK association with current user not found.";
                loadFilesButton.style.display = "block"; 
                return;
            }

            // Update UI for fingerprint authentication
            icon.src = "static/images/Biometric icon.png";
            icon.style.width = "100px";
            icon.style.height = "100px";
            icon.style.objectFit = "contain";
            
            message.textContent = "Scan Your Finger to Access HEK Files";
            message.style.color = "#D11C1C";

            // Step 2: Introduce a delay before fingerprint authentication
            setTimeout(async () => {
                try {
                    const fingerprintResponse = await fetch("/fingerprint-auth");
                    const fingerprintData = await fingerprintResponse.json();

                    if (!fingerprintData.success) {
                        if (fingerprintData.message.includes("Timeout")) {
                            message.textContent = "Timeout: Scan Your Finger to Access HEK Files";
                            message.style.color = "#000000";
                            loadFilesButton.style.display = "block";
                        } else {
                            message.textContent = fingerprintData.message;
                            loadFilesButton.style.display = "block";
                        }
                        return;  // Ensure we stop here if fingerprint auth fails
                    }

                    // Step 3: Introduce a delay before activating mass storage
                    setTimeout(async () => {
                        icon.src = "static/images/loader2.gif";
                        icon.style.width = "350px";
                        icon.style.height = "350px";
                        message.textContent = "Biometric Authentication Successfull: Activating HEK Mass Storage";
                        try {
                            const storageResponse = await fetch("/activate-mass-storage");
                            const storageData = await storageResponse.json();

                            if (storageData.success) {
                                message.textContent = "Mass storage activated. You can now access HEK files.";
                                message.style.color = "#008000"; // Green color for success
                            } else {
                               
                                // 10-second delay before hitting GET /load
            setTimeout(async () => {
                const currentContent = document.getElementById('current-content');
                const newContent = document.getElementById('new-content');
                currentContent.style.display = 'block';
                newContent.style.display = 'none';
                
                // try {
                //     const loadResponse = await fetch("/load");
                //     const loadData = await loadResponse.json();
                //     console.log("Response from /load:", loadData);
                // } catch (loadError) {
                //     console.error("Error during /load request:", loadError);
                // }

                
                loadDirectories(); // Fetch directories on page load

    async function loadDirectories() {
        try {
            const response = await fetch("/load");
            const data = await response.json();

            if (data.error) {
                console.error("Error loading directories:", data.error);
                return;
            }
            console.log("data",data)
            renderDirectories(data.children); // Render only directories
        } catch (error) {
            console.error("Error fetching directories:", error);
        }
    }

    function renderDirectories(directories) {
        const fileContainer = document.querySelector('.folder-section');
        console.log('directories ===========>>>>>>', directories)

        directories.forEach((directories) => {
            const fileDiv = document.createElement("div");
            if(directories.type=="directory"){
                console.log("full_path",directories.full_path)
            fileDiv.innerHTML = `
                <div class="folder-container">
                <div class="folder">
                    <!-- Folder content: image and name on the left side -->
                    <div class="folder-content">
                        <img src="../static/images/Folder.png" alt="folderimg">
                        <div>
                            <div class="folder-name">${directories.name}</div>
                            <div class="folder-time">${directories.dateTime}</div>
                        </div>
                    </div>

                    <!-- Button and image on the right side -->
                    <button>
                        <img src="../static/images/Vector Smart Object (3).png" alt="image"> <!-- Image inside the button -->
                        ${directories.category} &nbsp;&gt;
                    </button>
                </div>
            
            </div>
            `;

        
            fileContainer.appendChild(fileDiv);
            }
        });
    }


            }, 10000); // 10-second delay
                            }
                        } catch (storageError) {
                            console.error("Error during mass storage activation:", storageError);
                            message.textContent = "An error occurred during mass storage activation.";
                            message.style.color = "#D11C1C";
                        }
                    }, 1500); // Delay of 1.5 seconds before calling activate-mass-storage
                } catch (fingerprintError) {
                    console.error("Error during fingerprint authentication:", fingerprintError);
                    message.textContent = "An error occurred during fingerprint authentication.";
                    message.style.color = "#D11C1C";
                }
            }, 1500); // Delay of 1.5 seconds before calling fingerprint-auth
        } catch (error) {
            console.error("Error during file loading:", error);
            message.textContent = "An error occurred. Please try again.";
            message.style.color = "#D11C1C";
        }
    });
});


document.addEventListener("DOMContentLoaded", function () {

    const currentContent = document.getElementById('current-content');
    const newContent = document.getElementById('new-content');
    currentContent.style.display = 'none';
    newContent.style.display = 'block';
    // Example: Update storage dynamically
    const storageUsed = 200; // GB
    const totalStorage = 500; // GB
    const storageBar = document.querySelector('.storage-bar');
    storageBar.style.width = (storageUsed / totalStorage * 100) + '%';
});

document.addEventListener("DOMContentLoaded", function () {
    console.log("JavaScript Loaded");

    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            console.log(button.id + " clicked");

            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
});

// Function to display current date and time
function updateFolderTime(folderId) {
    const timeElement = document.getElementById(folderId);
    const currentTime = new Date().toLocaleString(); // Gets current date and time
    timeElement.textContent = currentTime; // Updates the folder time
}

// Call the function for each folder
setInterval(() => updateFolderTime('folderTime1'), 1000); // Update every second

const files = [
    {
        image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
        fileName: "Image 1",
        dateTime: "2025-01-22 12:34 PM 670kb"
    },
    {
        image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
        fileName: "Image 2",
        dateTime: "2025-01-22 12:35 PM 700kb"
    }, {
        image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
        fileName: "Image 2",
        dateTime: "2025-01-22 12:35 PM 700kb"
    }, {
        image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
        fileName: "Image 2",
        dateTime: "2025-01-22 12:35 PM 700kb"
    }, {
        image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
        fileName: "Image 2",
        dateTime: "2025-01-22 12:35 PM 700kb"
    }, {
        image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
        fileName: "Image 2",
        dateTime: "2025-01-22 12:35 PM 700kb"
    }, {
        image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
        fileName: "Image 2",
        dateTime: "2025-01-22 12:35 PM 700kb"
    }, {
        image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
        fileName: "Image 2",
        dateTime: "2025-01-22 12:35 PM 700kb"
    }, {
        image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
        fileName: "Image 2",
        dateTime: "2025-01-22 12:35 PM 700kb"
    }, {
        image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
        fileName: "Image 2",
        dateTime: "2025-01-22 12:35 PM 700kb"
    }, {
        image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
        fileName: "Image 2",
        dateTime: "2025-01-22 12:35 PM 700kb"
    }, {
        image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
        fileName: "Image 2",
        dateTime: "2025-01-22 12:35 PM 700kb"
    }, {
        image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
        fileName: "Image 2",
        dateTime: "2025-01-22 12:35 PM 700kb"
    }, {
        image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
        fileName: "Image 2",
        dateTime: "2025-01-22 12:35 PM 700kb"
    }, {
        image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
        fileName: "Image 2",
        dateTime: "2025-01-22 12:35 PM 700kb"
    }, {
        image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
        fileName: "Image 2",
        dateTime: "2025-01-22 12:35 PM 700kb"
    }, {
        image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
        fileName: "Image 2",
        dateTime: "2025-01-22 12:35 PM 700kb"
    }, {
        image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
        fileName: "Image 2",
        dateTime: "2025-01-22 12:35 PM 700kb"
    }, {
        image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
        fileName: "Image 2",
        dateTime: "2025-01-22 12:35 PM 700kb"
    }, {
        image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
        fileName: "Image 2",
        dateTime: "2025-01-22 12:35 PM 700kb"
    }, {
        image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
        fileName: "Image 2",
        dateTime: "2025-01-22 12:35 PM 700kb"
    }, {
        image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
        fileName: "Image 2",
        dateTime: "2025-01-22 12:35 PM 700kb"
    }, {
        image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
        fileName: "Image 2",
        dateTime: "2025-01-22 12:35 PM 700kb"
    }, {
        image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
        fileName: "Image 2",
        dateTime: "2025-01-22 12:35 PM 700kb"
    },
    // Add more file objects as necessary...
];

const fileContainer = document.querySelector('.file-container');

files.forEach((file) => {
    const fileDiv = document.createElement("div");
    fileDiv.classList.add("folder");

    fileDiv.innerHTML = `
        <div class="folder-content" style="display: flex; justify-content: space-between; align-items: center; position: relative;">
            <div class="folder-icon">
                <img src="${file.image}" alt="${file.fileName}" style="width: 70px; height: 70px; object-fit: cover;" />
            </div>
            <div style="flex: 1; padding-right: 20px;">
                <div class="folder-name">${file.fileName}</div>
                <!-- Separator Image -->
                <div class="folder-separate-image" style="width: 100%; display: flex; margin-top: -20px;">
                    <img src="../images/file.png" alt="Separator Image" style="width: 100%; height: 10px; object-fit: cover; margin: 20px 0;" />
                </div>
                <div class="folder-time">${file.dateTime}</div>
            </div>
            <div class="kebab-menu">
                <button class="kebab-menu-btn">⋮</button>
                <div class="modal">
                    <div class="modal-content">
                        <div class="popup-option">
                            <img src="icon1.png" alt="icon1">
                            <span>${file.fileName}</span>
                        </div>
                        <!-- Other options -->
                    </div>
                </div>
            </div>
        </div>
    `;

    fileContainer.appendChild(fileDiv);
});

// Function to open the modal and toggle visibility
const kebabButtons = document.querySelectorAll('.kebab-menu-btn');
kebabButtons.forEach((button) => {
    const modal = button.closest('.kebab-menu').querySelector('.modal'); // Get the modal corresponding to this button
    const fileName = button.closest('.folder-content').querySelector('.folder-name').textContent; // Get the file name

    button.addEventListener('click', (e) => {
        // Close all modals
        const allModals = document.querySelectorAll('.modal');
        allModals.forEach((m) => {
            if (m !== modal) m.style.display = 'none';
        });

        // Toggle modal visibility
        modal.style.display = modal.style.display === 'block' ? 'none' : 'block';

        // Display file name in the console or elsewhere
        console.log("File Name: " + fileName); // This will log the file name when the kebab menu is clicked

        e.stopPropagation(); // Prevents click event from propagating to the parent div
    });
});

// Close modal when clicking outside the modal
document.addEventListener('click', (e) => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (!modal.contains(e.target) && !modal.previousElementSibling.contains(e.target)) {
            modal.style.display = 'none';
        }
    });
});
