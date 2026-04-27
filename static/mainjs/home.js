let currentFileName = "";
let dName = "";
let currentDirectoryPath = "";
let clicked_directory = "";
var allUsers = [];
var userId = '';
// pop ups closing listner start
document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", (event) => {
        const button = event.target.closest(".btnnnn");

        if (button) {
            const kebabMenu = button.closest(".kebab-menu");
            const popup = kebabMenu.querySelector(".popup");

            // Sare popups close karne ke liye
            document.querySelectorAll(".popup").forEach(p => {
                if (p !== popup) p.style.display = "none";
            });

            // Current popup toggle kare
            popup.style.display = popup.style.display === "block" ? "none" : "block";
        }

        // Close button par click hone par popup hide kare
        if (event.target.classList.contains("close")) {
            event.target.closest(".popup").style.display = "none";
        }

        // Agar kisi aur jagah click hua to popup band kare
        if (!event.target.closest(".kebab-menu")) {
            document.querySelectorAll(".popup").forEach(p => p.style.display = "none");
        }
    });
});
// pop ups closing listner start

// Request permission for notifications start
function requestPermission() {
    if (Notification.permission !== 'granted') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted!');
            } else {
                console.log('Notification permission denied. Check and Allow manually.');
            }
        });
    } else {
        console.log('Notification permission already granted!');
    }
};

requestPermission();

// Request permission for notifications end

document.addEventListener("DOMContentLoaded", function () {
    let link = document.createElement("link");
    link.rel = "icon";
    link.href = "/static/images/my-icon.ico"; // Ensure correct path
    document.head.appendChild(link);
});

// handle sliderbar func start
function toggleSidebar() {
    let sidebar = document.getElementById("sidebar");
    let sidebarMain = document.getElementById("sidebarMain");

    if (sidebar.classList.contains("open")) {
        sidebar.classList.remove("open");
        sidebarMain.style.display = "none"; // Hide background overlay
    } else {
        sidebar.classList.add("open");
        sidebarMain.style.display = "block"; // Show background overlay
    }
}
// handle sliderbar func start

// current logged in user func start
const getCurrentUserData = async () => {
    const token = localStorage.getItem('access_token');

    try {
        const response = await fetch('https://enigmakey.tech/serv/get-user-profile', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();
        console.log("🚀 ~ getCurrentUserData ~ response:", data?.user);
        localStorage.setItem('userId', data.user.id);

        if (data?.user) {
            const currentUser = {
                ...data.user,
                profileImage: data.user.profile_image
                    ? `https://enigmakey.tech/serv/files/${data.user.profile_image}`
                    : `../static/chatimg/user-profile.png`,
                fullName: `${data.user.first_name || ""} ${data.user.last_name || ""}`.trim() || "User",
            };

            console.log("✅ Updated currentUser:", currentUser);
            return currentUser;
        } else {
            console.log("⚠️ User data not found!");
            return null;
        }

    } catch (error) {
        console.log("🚀 ~ getCurrentUserData ~ error:", error);
        return null;
    }
};
// current logged in user func start

// update profile func start
const updateUserProfile = async () => {
    const user = await getCurrentUserData();
    if (user) {
        // Update all profile images
        document.querySelectorAll(".profile img:first-child").forEach(img => {
            img.src = user.profileImage;
        });

        // Update all profile names
        document.querySelectorAll(".profile span").forEach(span => {
            span.textContent = user.fullName;
        });

        // Update all emails (only targets small tags with class 'user-email')
        document.querySelectorAll(".profile .user-email").forEach(email => {
            email.textContent = user.email;
        });
    }
};


// Call function to update profile image and name when page loads
updateUserProfile();

// update profile func end

// footer func start
let data;
function adjustFooterMargin() {
    const footer = document.querySelector(".heading-container");
    let content = document.querySelector('.content');

    let windowHeight = window.innerHeight;
    let contentHeight = document.body.scrollHeight - footer.offsetHeight;

    // Agar content screen se chhota hai toh margin-top add kar ke bottom pe push karega
    if (contentHeight < windowHeight) {
        let extraSpace = windowHeight - contentHeight - 70;
        footer.style.marginTop = extraSpace + "px";
    } else {
        footer.style.marginBottom = "0";
    }
}
// footer func end

//  mass-storage func start
async function isMassStorageActivated() {
    try {
        const response = await fetch("/session-data");

        if (!response.ok) {
            console.error("Failed to fetch session data. Status:", response.status);
            return false;
        }

        const data = await response.json();

        if (!data || typeof data !== "object" || !data.success || !data.user_data) {
            console.error("Invalid response structure:", data);
            return false;
        }
        console.log("data.user_data.mass_storage_activated", data.user_data.mass_storage_activated)
        return Boolean(data.user_data.mass_storage_activated);
    } catch (error) {
        console.error("Error fetching session data:", error);
        return false;
    }
}
//  mass-storage func end

//globally use listner for pop ups start
document.addEventListener("click", (event) => {
    if (!event.target.closest('.custom-popup1, .options-button, .rename-modal, .delete-modal')) {
        document.querySelectorAll(".custom-popup1, .rename-modal, .delete-modal").forEach(popup => {
            popup.classList.add("hidden");
        });
    }
});
//globally use listner for pop ups start


// Adjust on load and resize and all directories func start
window.onload = adjustFooterMargin;
window.onresize = adjustFooterMargin;
document.addEventListener("DOMContentLoaded", function () {
    isMassStorageActivated().then((activated) => {
        if (activated) {
            const currentContent = document.getElementById('current-content');
            const newContent = document.getElementById('new-content');
            currentContent.style.display = 'block';
            newContent.style.display = 'none';
            loadDirectoriess();
            console.log("here here");
            let usbConnected = true; // Initial assumption

            function checkUSBStatus() {
                fetch('/usb-status')
                    .then(response => response.json())
                    .then(data => {
                        console.log("USB Status:", data.usb_connected);

                        // Update USB connection status
                        usbConnected = data.usb_connected;

                        if (!usbConnected) {
                            console.log("USB disconnected. Stopping further checks.");
                            clearInterval(usbCheckInterval);

                            // Call deactivate-mass-storage API
                            fetch('/deactivate-mass-storage', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            })
                                .then(response => {
                                    if (response.ok) {
                                        console.log("Mass storage deactivated.");
                                        localStorage.removeItem("access_token"); // Token ko localStorage se remove karega
                                        localStorage.removeItem("currentUser"); // Token ko localStorage se remove karega
                                        localStorage.removeItem("userId"); // Token ko localStorage se remove karega
                                        localStorage.removeItem("selectedUser"); // Token ko localStorage se remove karega

                                        // alert('You have been logged out.');

                                        // Redirect to Sign In Page
                                        window.location.href = "/signin"; // Redirect URL ko apne page ke mutabiq change karein
                                        //location.reload(); // Reload the page on success
                                    } else {
                                        console.error("Failed to deactivate mass storage.");
                                    }
                                })
                                .catch(error => {
                                    console.error("Error calling deactivate-mass-storage:", error);
                                });
                        }
                    })
                    .catch(error => {
                        console.error("Error checking USB status:", error);
                    });
            }


            // Pehle call karo jab page load ho
            //checkUSBStatus();

            // 5 second ke interval pe call karo agar USB connected hai
            const usbCheckInterval = setInterval(() => {
                if (usbConnected) {
                    checkUSBStatus();
                }
            }, 15000);
        } else {
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
                    const broadcastResponse = await fetch("/activate-mass");
                    const broadcastData = await broadcastResponse.json();
                    console.log("broadcastData", broadcastData);

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
                            // Show loader and prevent scrolling
                            document.getElementById("loaderr").style.display = "flex";
                            document.body.style.overflow = "hidden";
                            console.log("ab m chala dek")
                            try {
                                const response = await fetch("/load");
                                data = await response.json();

                                if (data.error) {
                                    //console.error("Error loading directories:", data.error);
                                    logout();
                                    return;
                                }
                                // Hide loader after processing
                                document.getElementById("loaderr").style.display = "none";
                                document.body.style.overflow = "auto"; // Restore scrolling
                                console.log("data", data)
                                getStorageInfo();
                                renderDirectories(data.children); // Render only directories
                            } catch (error) {
                                console.error("Error fetching directories:", error);
                            }
                        }

                        async function getStorageInfo() {
                            try {
                                const response = await fetch("/get_storage_info");
                                const storageData = await response.json();

                                if (storageData.error) {
                                    console.error("Error fetching storage info:", storageData.error);
                                    return;
                                }

                                console.log("Storage Info:", storageData);

                                // Format used storage
                                let usedText = "";
                                if (storageData.used < 1) {
                                    const usedInMB = (storageData.used * 1024).toFixed(2); // 2 decimal places
                                    usedText = `${usedInMB}MB`;
                                } else {
                                    usedText = `${storageData.used.toFixed(2)}GB`;
                                }

                                // Update Storage UI
                                document.querySelector(".large-text").textContent = usedText;
                                document.querySelector(".small-text").textContent = `used of ${storageData.total}GB`;

                                const percentage = (storageData.used / storageData.total) * 100;

                                // Update Progress Bar Width
                                const progressBar = document.querySelector(".progress-fill");
                                progressBar.style.width = `${percentage}%`;

                            } catch (error) {
                                console.error("Error fetching storage info:", error);
                            }
                        }


                        function renderDirectories(directories, container = document.querySelector('.folder-section')) {
                            container.innerHTML = ""; // Clear previous content
                            document.addEventListener("click", () => {
                                document.querySelectorAll(".custom-popup").forEach((popup) => {
                                    popup.classList.add("hidden");
                                });
                            });

                            directories.forEach((directory) => {
                                if (directory.type === "directory") {
                                    // Create folder container
                                    const folderContainer = document.createElement("div");
                                    folderContainer.classList.add("folder-container");

                                    // Folder content
                                    folderContainer.innerHTML = `
                                        <div class="folder">
                                            <!-- Left Side: Confidential Image & Folder Details -->
                                            <div class="folder-content">
                                    
                                                <div class="folder-info">
                                                    <img src="static/images/Folder.png" alt="folderimg" class="folder-click">
                                                    <div>
                                                        <div class="folder-name folder-click">${directory.name}</div>
                                                        <div class="folder-time">${directory.dateTime || "N/A"}</div>
                                                    </div>
                                                </div>
                                            </div>
                            
                                            <!-- Right Side: Category & Greater Than Sign -->
                                            <div class="folder-actions">
                                                <button class="category-button">
                                                    <img src="static/images/Vector Smart Object (3).png" alt="image">
                                                    ${directory.category}
                                                </button>
                                                <button class="options-button">&gt;</button>
                                            </div>
                                        </div>
                            
<!-- Options Popup -->
<div class="custom-popup1 hidden" id="options-popup-${directory.name}">
<div class="popup-content1">

<div class="button-row">
    <button class="rename-btn" data-bs-toggle="modal" data-bs-target="#renameModal-${directory.name}">
  Rename
</button>

    <button class="delete-btn" data-bs-toggle="modal" data-bs-target="#deleteModal-${directory.name}">
  Delete
</button>
   <!-- <button class="past-btn"  onclick='Past("${directory.name}")'>Past</button> -->
</div>
</div>
</div>


<!-- Rename Modal -->
<div class="modal fade" id="renameModal-${directory.name}" tabindex="-1" aria-labelledby="renameModalLabel-${directory.name}" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">

      <div class="modal-header">
        <h5 class="modal-title" id="renameModalLabel-${directory.name}">Rename Folder</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body">
        <input type="text" class="form-control rename-input" id="rename-input-${directory.name}" placeholder="${directory.name}">
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-success" style="height: auto;" onclick='folderRename("${directory.name}", document.getElementById("rename-input-${directory.name}").value)'>
          Confirm
        </button>
      </div>

    </div>
  </div>
</div>


<!-- Delete Popup -->
<!-- Delete Modal -->
<div class="modal fade" id="deleteModal-${directory.name}" tabindex="-1" aria-labelledby="deleteModalLabel-${directory.name}" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">

      <div class="modal-header">
        <h5 class="modal-title" id="deleteModalLabel-${directory.name}">Delete Confirmation</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body" style="color: white;">
        Are you sure you want to delete the folder <strong>${directory.name}</strong>?
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" style="height: auto;" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-danger" style="height: auto;" onclick='folderDelete("${directory.name}")'>
          Yes, Delete
        </button>
      </div>

    </div>
  </div>
</div>`;

                                    // Get elements
                                    const folderImage = folderContainer.querySelector(".folder-click");
                                    const folderName = folderContainer.querySelector(".folder-name");


                                    // Click event only on folder image and name
                                    [folderImage, folderName].forEach((element) => {
                                        element.addEventListener("click", (event) => {
                                            event.stopPropagation();
                                            clicked_directory = directory.name;
                                            console.log("Clicked Folder:", directory.name);
                                            console.log("Children:", directory.children);
                                            renderChildren(directory.children, directory.name, directory.full_path);
                                        });
                                    });

                                    const optionsButton = folderContainer.querySelector(".options-button");
                                    const renameBtn = folderContainer.querySelector(".rename-btn");
                                    const deleteBtn = folderContainer.querySelector(".delete-btn");
                                    const pastBtn = folderContainer.querySelector(".past-btn");

                                    optionsButton.addEventListener("click", (event) => {
                                        event.stopPropagation();
                                        document.querySelectorAll(".custom-popup1, .rename-modal, .delete-modal").forEach(popup => {
                                            popup.classList.add("hidden");
                                        });
                                        document.getElementById(`options-popup-${directory.name}`)?.classList.toggle("hidden");
                                    });

                                    renameBtn?.addEventListener("click", (e) => {
                                        e.stopPropagation();
                                        document.getElementById(`options-popup-${directory.name}`)?.classList.add("hidden");
                                        document.getElementById(`rename-popup-${directory.name}`)?.classList.remove("hidden");
                                    });

                                    deleteBtn?.addEventListener("click", (e) => {
                                        e.stopPropagation();
                                        document.getElementById(`options-popup-${directory.name}`)?.classList.add("hidden");
                                        document.getElementById(`delete-popup-${directory.name}`)?.classList.remove("hidden");
                                    });

                                    pastBtn?.addEventListener("click", (e) => {
                                        e.stopPropagation();

                                    });

                                    const closeRenameBtn = folderContainer.querySelector(".close-rename");
                                    const closeDeleteBtn = folderContainer.querySelector(".close-delete");

                                    closeRenameBtn?.addEventListener("click", (event) => {
                                        event.stopPropagation();
                                        document.getElementById(`rename-popup-${directory.name}`)?.classList.add('hidden');
                                    });

                                    closeDeleteBtn?.addEventListener("click", (event) => {
                                        event.stopPropagation();
                                        document.getElementById(`delete-popup-${directory.name}`)?.classList.add('hidden');
                                    });
                                    // Append to the container
                                    container.appendChild(folderContainer);
                                }
                            });

                        }




                        function getFileIcon(file) {
                            const nameParts = file.name.toLowerCase().split('.');

                            // Ensure at least one extension exists
                            if (nameParts.length < 2) {
                                return "static/images/file.png"; // Default for files without extensions
                            }

                            // Extract last and second-last extensions
                            const lastExt = nameParts.pop(); // Last extension
                            const secondLastExt = nameParts.length > 0 ? nameParts.pop() : null; // Second-last extension (if available)

                            // Define file type categories
                            const videoExtensions = ["mp4", "avi", "mov", "mkv", "flv", "wmv", "webm"];
                            const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "tiff"];
                            const audioExtensions = ["mp3", "wav", "ogg", "flac", "aac"];
                            const documentExtensions = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"];
                            const encryptionExtensions = ["rsa", "ecc", "aes", "kem", "kpke", "ltm", "tn"];
                            console.log("lastExt", lastExt)
                            // Check if the last extension is an encryption type
                            if (encryptionExtensions.includes(lastExt)) {
                                return "static/images/enc.png";
                            }

                            // If no encryption extension, determine the correct file type
                            const fileExtension = lastExt;

                            if (videoExtensions.includes(fileExtension) || imageExtensions.includes(fileExtension)) {
                                return `data:image/png;base64,${file.thumbnail_base64}`;
                            } else if (documentExtensions.includes(fileExtension)) {
                                return "static/images/doc.png";
                            } else if (audioExtensions.includes(fileExtension)) {
                                return "static/images/music.png";
                            } else {
                                return "static/images/file.png"; // Default file icon
                            }
                        }


                        // Allowed file extensions
                        const videoExtensions = ['.mp4', '.avi', '.mkv', '.mov', '.flv', '.webm'];
                        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
                        const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a'];
                        const documentExtensions = ['.pdf', '.docx', '.txt'];

                        // Function to get the appropriate action button
                        function getFileActionButton(file) {
                            let filePath = file.path;
                            let fileName = file.name.toLowerCase();

                            if (videoExtensions.some(ext => fileName.endsWith(ext))) {
                                return `
<button class="popup-option" onclick="playVideo('${filePath}')">
<img src="static/images/play.png" alt="Play">
<span>Play Video</span>
</button>
`;
                            }

                            if (imageExtensions.some(ext => fileName.endsWith(ext))) {
                                return `
<button class="popup-option" onclick="viewImage('${filePath}')">
<img src="static/images/Image Icon.png" alt="View">
<span>View Image</span>
</button>
`;
                            }

                            if (audioExtensions.some(ext => fileName.endsWith(ext))) {
                                return `
<button class="popup-option" onclick="playAudio('${filePath}')">
<img src="static/images/play.png" alt="Play">
<span>Play Audio</span>
</button>
`;
                            }

                            if (documentExtensions.some(ext => fileName.endsWith(ext))) {
                                return `
<button class="popup-option" onclick="viewDocument('${filePath}')">
<img src="static/images/Documents new Icon.png" alt="View">
<span>View Document</span>
</button>
`;
                            }

                            return ''; // No button if it's an unsupported file type
                        }


                        // Function to replace the entire section with ONLY the clicked folder's children
                        function renderChildren(children, directoryName, directoryPath) {
                            currentDirectoryPath = directoryPath;
                            console.log("currentDirectoryPath", currentDirectoryPath)
                            const container = document.querySelector('.folder-section');
                            container.style.display = 'none'; // Clear everything

                            const storage = document.querySelector('.storage-info');
                            storage.style.display = "none";

                            const btnContainer = document.querySelector('.button-container');
                            btnContainer.style.display = "none";

                            const network = document.querySelector('.network-status');
                            network.style.display = "none";

                            const fileContainer = document.querySelector('.file-container');
                            fileContainer.style.display = 'block';
                            document.getElementById('uploadBtnWrapper').style.display = 'block';
                            document.querySelector('.upload-container').classList.add('show');

                            // Add class to make footer fixed
                            // document.querySelector('.heading-container').classList.add("fixed-footer");


                            document.querySelector('.logoo').innerText = directoryName;

                            let img = document.querySelector('.logooo img');

                            // Change the image source
                            img.src = "static/images/back.png";

                            // Set width and height styles
                            img.style.width = "25px";
                            img.style.height = "auto";
                            img.style.cursor = "pointer";

                            let hf = document.querySelector('.hf'); 
                            hf.style.display = "none";

                            console.log("img",img)

                            // Add click event listener
                            img.addEventListener("click", function () {
                                hf.style.display = "block";
                                const container = document.querySelector('.folder-section');
                                container.style.display = 'block'; // Show the folder section

                                btnContainer.style.display = "flex";

                                storage.style.display = 'block'; // Show the folder section
                                network.style.display = "block";

                                const fileContainer = document.querySelector('.file-container');
                                fileContainer.style.display = 'none'; // Hide file container
                                document.getElementById('uploadBtnWrapper').style.display = 'none';
                                document.querySelector('.upload-container').classList.remove('show');



                                document.querySelector('.logoo').innerText = ""; // Clear text

                                // Change image source
                                // img.src = "static/images/Group 21.png";
                                // img.style.width = "60px";
                                // img.style.height = "auto";
                                fileContainer.innerHTML = "";

                                // Remove fixed footer class
                                // document.querySelector('.heading-container').classList.remove("fixed-footer");

                                // ✅ Re-run user profile update
                                updateUserProfile(); // <--- ADD THIS LINE


                            });

                            if (!children || children.length === 0) {
                                fileContainer.innerHTML = "<p>No files or folders inside.</p>";
                                return;
                            }



                            children.forEach((file) => {
                                const fileDiv = document.createElement("div");
                                fileDiv.classList.add("folder");





                                // Updating the fileDiv innerHTML
                                fileDiv.innerHTML = `
<div class="folder-content" style="display: flex; justify-content: space-between; align-items: center; position: relative;">
<div class="folder-icon">
<img src="${getFileIconn(file)}" alt="${file.name}" style="width: 56px; height: 56px; object-fit: cover;" />
</div>
<div style="flex: 1; padding-right: 20px;">
<div class="folder-name" style="margin-left: 10px;">${file.name}</div>
<div class="folder-separate-image">
<img src="static/images/file.png" alt="Separator Image" />
</div>
<div class="folder-time" style="margin-top:-45px; margin-left: 10px;">${file.dateTime}</div>
</div>
<div class="kebab-menu">
<button type="button" class="btnnnn">
<img src="static/images/3_dots.png" alt="dots" class="dots-img">
</button>
<div class="popup">
<div class="popup-content">
<span class="close">&times;</span>
${getFileActionButtonn(file)}
<!-- <button class="popup-option" data-bs-toggle="modal" data-bs-target="#myModal">
<img src="static/images/share.png" alt="Share">
<span>Share</span>
</button> -->
<button class="popup-option" data-bs-toggle="modal" data-bs-target="#renameModal" onclick="setCurrentFile('${file.path}', '${directoryName}')">
<img src="static/images/rename1.png" alt="Rename">
<span>Rename</span>
</button>
<button class="popup-option" data-bs-toggle="modal" data-bs-target="#deleteModal" onclick="setCurrentFile('${file.path}', '${directoryName}')">
<img src="static/images/delete.png" alt="Delete">
<span>Delete</span>
</button>

<!-- Encryption Dropdown -->
<div class="dropdown">
<button class="popup-option dropdown-btn">
    <img src="static/images/lock.png" alt="Encryption">
    <span>Encryption</span>
    <span class="select-btn" onclick="toggleDropdown(event)">Select</span> 
</button>

<div class="dropdown-content">
<button onclick="handleAES(&quot;${file.path}&quot;, &quot;${directoryName}&quot;)">AES</button>
  <button onclick="handleRSA(&quot;${file.path}&quot;, &quot;${directoryName}&quot;)">RSA</button>
  <button onclick="handleECC(&quot;${file.path}&quot;, &quot;${directoryName}&quot;)">ECC</button>
  <button onclick="handleKEM(&quot;${file.path}&quot;, &quot;${directoryName}&quot;)">KEM</button>
  <button onclick="handleKPKE(&quot;${file.path}&quot;, &quot;${directoryName}&quot;)">KPKE</button>
  <button onclick="handleLTM(&quot;${file.path}&quot;, &quot;${directoryName}&quot;)">LTM</button>
  <button onclick="handleTN(&quot;${file.path}&quot;, &quot;${directoryName}&quot;)">TN</button>
</div>
</div>

<button class="popup-option" data-bs-toggle="modal" data-bs-target="#decryptModal" onclick="setCurrentFile(&quot;${file.path}&quot;, &quot;${directoryName}&quot;)">
<img src="static/images/delete.png" alt="Decrypt">
<span>Decrypt</span>
</button>

<!-- <button class="popup-option">
<img src="static/images/copy.png" alt="Copy">
<span>Copy</span>
</button> -->
</div>
</div>
</div>
</div>

`;

                                fileContainer.appendChild(fileDiv);





                            });
                        }




                    }, 5000); // 10-second delay


                } catch (error) {
                    console.error("Error during file loading:", error);
                    message.textContent = "An error occurred. Please try again.";
                    message.style.color = "#D11C1C";
                }
            });
        }
    });
});
// Adjust on load and resize and all directories func end

// playVideo func start
function playVideo(videoPath) {
    let videoElement = document.getElementById("videoPlayer");
    let videoSource = document.getElementById("videoSource");

    fetch('/play_video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_path: videoPath })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showCustomAlert(data.error);
            } else {
                videoSource.src = data.video_url;
                videoElement.load();
                videoElement.play();
                new bootstrap.Modal(document.getElementById("videoModal")).show();
            }
        })
        .catch(error => {
            showCustomAlert("Error loading video: " + error.message);
        });
}
// playVideo func start

// viewImage func start
function viewImage(imagePath) {
    fetch('/view_image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_path: imagePath })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showCustomAlert(data.error);
            } else {
                document.getElementById("imageModalSource").src = data.image_url;
                new bootstrap.Modal(document.getElementById("imageModal")).show();
            }
        })
        .catch(error => {
            showCustomAlert("Error loading image: " + error.message);
        });
}
// viewImage func end

// playAudio func start
function playAudio(audioPath) {
    fetch('/play_audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio_path: audioPath })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showCustomAlert(data.error);
            } else {
                document.getElementById("audioSource").src = data.audio_url;
                let audioElement = document.getElementById("audioPlayer");
                audioElement.load();
                audioElement.play();
                new bootstrap.Modal(document.getElementById("audioModal")).show();
            }
        })
        .catch(error => {
            showCustomAlert("Error loading audio: " + error.message);
        });
}
// playAudio func end

// viewDocument func start
function viewDocument(docPath) {
    fetch('/view_document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_path: docPath })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showCustomAlert(data.error);
            } else {
                document.getElementById("documentIframe").src = data.document_url;
                new bootstrap.Modal(document.getElementById("documentModal")).show();
            }
        })
        .catch(error => {
            showCustomAlert("Error loading document: " + error.message);
        });
}
// viewDocument func end

// storage bar code start
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
// storage bar code end

// folder section buttons code start
document.addEventListener("DOMContentLoaded", function () {
    console.log("JavaScript Loaded");

    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            console.log(button.id + " clicked");

            let relevantExtensions = [];
            let label = "";

            if (button.id === "videosBtn") {
                relevantExtensions = [
                    '.mp4', '.mkv', '.avi', '.mov',
                    '.mp4.ecc', '.mp4.rsa', '.mp4.aes', '.mp4.tn',
                    '.mp4.kpke', '.mp4.ltm', '.mp4.kem',
                    '.mkv.ecc', '.mkv.rsa', '.mkv.aes', '.mkv.tn',
                    '.mkv.kpke', '.mkv.ltm', '.mkv.kem',
                    '.avi.ecc', '.avi.rsa', '.avi.aes', '.avi.tn',
                    '.avi.kpke', '.avi.ltm', '.avi.kem',
                    '.mov.ecc', '.mov.rsa', '.mov.aes', '.mov.tn',
                    '.mov.kpke', '.mov.ltm', '.mov.kem'
                ];

                label = "Movies";
            }
            if (button.id === "imagesBtn") {
                relevantExtensions = [
                    '.jpg', '.jpeg', '.png', '.gif',
                    '.jpg.ecc', '.jpg.rsa', '.jpg.aes', '.jpg.tn',
                    '.jpg.kpke', '.jpg.ltm', '.jpg.kem',
                    '.jpeg.ecc', '.jpeg.rsa', '.jpeg.aes', '.jpeg.tn',
                    '.jpeg.kpke', '.jpeg.ltm', '.jpeg.kem',
                    '.png.ecc', '.png.rsa', '.png.aes', '.png.tn',
                    '.png.kpke', '.png.ltm', '.png.kem',
                    '.gif.ecc', '.gif.rsa', '.gif.aes', '.gif.tn',
                    '.gif.kpke', '.gif.ltm', '.gif.kem'
                ];

                label = "Pictures";
            }
            if (button.id === "audioBtn") {
                relevantExtensions = [
                    '.mp3', '.wav', '.aac',
                    '.mp3.ecc', '.mp3.rsa', '.mp3.aes', '.mp3.tn',
                    '.mp3.kpke', '.mp3.ltm', '.mp3.kem',
                    '.wav.ecc', '.wav.rsa', '.wav.aes', '.wav.tn',
                    '.wav.kpke', '.wav.ltm', '.wav.kem',
                    '.aac.ecc', '.aac.rsa', '.aac.aes', '.aac.tn',
                    '.aac.kpke', '.aac.ltm', '.aac.kem'
                ];

                label = "Music";
            }
            if (button.id === "documentBtn") {
                relevantExtensions = [
                    '.pdf', '.docx', '.txt', '.xlsx',
                    '.pdf.ecc', '.pdf.rsa', '.pdf.aes', '.pdf.tn',
                    '.pdf.kpke', '.pdf.ltm', '.pdf.kem',
                    '.docx.ecc', '.docx.rsa', '.docx.aes', '.docx.tn',
                    '.docx.kpke', '.docx.ltm', '.docx.kem',
                    '.txt.ecc', '.txt.rsa', '.txt.aes', '.txt.tn',
                    '.txt.kpke', '.txt.ltm', '.txt.kem',
                    '.xlsx.ecc', '.xlsx.rsa', '.xlsx.aes', '.xlsx.tn',
                    '.xlsx.kpke', '.xlsx.ltm', '.xlsx.kem'
                ];

                label = "Documents";
            }

            let allRelevantChildren = [];

            data.children.forEach(folder => {
                if (folder.children && Array.isArray(folder.children)) {
                    const filtered = folder.children
                        .filter(child =>
                            relevantExtensions.some(ext =>
                                child.name?.toLowerCase().endsWith(ext)
                            )
                        )
                        .map(child => ({
                            ...child,
                            parentPath: folder.full_path  // 👈 add parent folder path to each file
                        }));

                    if (filtered.length > 0) {
                        allRelevantChildren.push(...filtered);
                    }
                }
            });

            renderChildrenn(allRelevantChildren, label, ""); // or pass "" if you're handling path per file

            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
});
// folder section buttons code end


//  loadDirectoriess func start
async function loadDirectoriess() {
    // Show loader and prevent scrolling
    document.getElementById("loader").style.display = "flex";
    document.body.style.overflow = "hidden";
    console.log("ab m chala dek")
    try {
        const response = await fetch("/load");
        data = await response.json();

        if (data.error) {
            //console.error("Error loading directories:", data.error);
            logout();
            return;
        }
        // Hide loader after processing
        document.getElementById("loader").style.display = "none";
        document.body.style.overflow = "auto"; // Restore scrolling
        console.log("data", data)
        getStorageInfoo();
        renderDirectoriess(data.children); // Render only directories
    } catch (error) {
        console.error("Error fetching directories:", error);
    }
}
//  loadDirectoriess func end

async function getStorageInfoo() {
    try {
        const response = await fetch("/get_storage_info");
        const storageData = await response.json();

        if (storageData.error) {
            console.error("Error fetching storage info:", storageData.error);
            return;
        }

        console.log("Storage Info:", storageData);

        // Format used storage
        let usedText = "";
        if (storageData.used < 1) {
            const usedInMB = (storageData.used * 1024).toFixed(2); // 2 decimal places
            usedText = `${usedInMB}MB`;
        } else {
            usedText = `${storageData.used.toFixed(2)}GB`;
        }

        // Update Storage UI
        document.querySelector(".large-text").textContent = usedText;
        document.querySelector(".small-text").textContent = `used of ${storageData.total}GB`;

        const percentage = (storageData.used / storageData.total) * 100;

        // Update Progress Bar Width
        const progressBar = document.querySelector(".progress-fill");
        progressBar.style.width = `${percentage}%`;

    } catch (error) {
        console.error("Error fetching storage info:", error);
    }
}

// folders render func start
function renderDirectoriess(directories, container = document.querySelector('.folder-section')) {
    container.innerHTML = ""; // Clear previous content
    document.addEventListener("click", () => {
        document.querySelectorAll(".custom-popup").forEach((popup) => {
            popup.classList.add("hidden");
        });
    });

    directories.forEach((directory) => {
        if (directory.type === "directory") {
            // Create folder container
            const folderContainer = document.createElement("div");
            folderContainer.classList.add("folder-container");

            // Folder content
            folderContainer.innerHTML = `
                <div class="folder">
                    <!-- Left Side: Confidential Image & Folder Details -->
                    <div class="folder-content">
            
                        <div class="folder-info">
                            <img src="static/images/Folder.png" alt="folderimg" class="folder-click">
                            <div>
                                <div class="folder-name folder-click">${directory.name}</div>
                                <div class="folder-time">${directory.dateTime || "N/A"}</div>
                            </div>
                        </div>
                    </div>
    
                    <!-- Right Side: Category & Greater Than Sign -->
                    <div class="folder-actions">
                        <button class="category-button">
                            <img src="static/images/Vector Smart Object (3).png" alt="image">
                            ${directory.category}
                        </button>
                        <button class="options-button">&gt;</button>
                    </div>
                </div>
    
<!-- Options Popup -->
<div class="custom-popup1 hidden" id="options-popup-${directory.name}">
<div class="popup-content1">
<div class="button-row">
<button class="rename-btn" data-bs-toggle="modal" data-bs-target="#renameModall-${directory.name}">
  Rename
</button>
<button class="delete-btn" data-bs-toggle="modal" data-bs-target="#deleteModall-${directory.name}">
  Delete
</button>
<!-- <button class="past-btn"  onclick='Past("${directory.name}")'>Past</button> -->
</div>
</div>
</div>

<!-- Rename Popup -->
<!-- Rename Popup -->
<!-- Rename Modal -->
<div class="modal fade" id="renameModall-${directory.name}" tabindex="-1" aria-labelledby="renameModalLabell-${directory.name}" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">

      <div class="modal-header">
        <h5 class="modal-title" id="renameModalLabell-${directory.name}">Rename Folder</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body">
        <input type="text" class="form-control rename-input" id="rename-input-${directory.name}" placeholder="${directory.name}">
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" style="height: auto;" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-success" style="height: auto;" onclick='folderRename("${directory.name}", document.getElementById("rename-input-${directory.name}").value)'>
          Confirm
        </button>
      </div>

    </div>
  </div>
</div>


<!-- Delete Popup -->
<div class="modal fade" id="deleteModall-${directory.name}" tabindex="-1" aria-labelledby="deleteModalLabell-${directory.name}" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">

      <div class="modal-header">
        <h5 class="modal-title" id="deleteModalLabell-${directory.name}">Delete Confirmation</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body" style="color: white;">
        Are you sure you want to delete the folder <strong>${directory.name}</strong>?
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" style="height: auto;" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-danger" style="height: auto;" onclick='folderDelete("${directory.name}")'>
          Yes, Delete
        </button>
      </div>

    </div>
  </div>
</div>
            `;

            // Get elements
            const folderImage = folderContainer.querySelector(".folder-click");
            const folderName = folderContainer.querySelector(".folder-name");


            // Click event only on folder image and name
            [folderImage, folderName].forEach((element) => {
                element.addEventListener("click", (event) => {
                    event.stopPropagation();
                    clicked_directory = directory.name;
                    console.log("Clicked Folder:", directory.name);
                    console.log("Children:", directory.children);
                    renderChildrenn(directory.children, directory.name, directory.full_path);
                });
            });

            const optionsButton = folderContainer.querySelector(".options-button");
            const renameBtn = folderContainer.querySelector(".rename-btn");
            const deleteBtn = folderContainer.querySelector(".delete-btn");
            const pastBtn = folderContainer.querySelector(".past-btn");

            optionsButton.addEventListener("click", (event) => {
                event.stopPropagation();
                document.querySelectorAll(".custom-popup1, .rename-modal, .delete-modal").forEach(popup => {
                    popup.classList.add("hidden");
                });
                document.getElementById(`options-popup-${directory.name}`)?.classList.toggle("hidden");
            });

            renameBtn?.addEventListener("click", (e) => {
                e.stopPropagation();
                document.getElementById(`options-popup-${directory.name}`)?.classList.add("hidden");
                document.getElementById(`rename-popup-${directory.name}`)?.classList.remove("hidden");
            });

            deleteBtn?.addEventListener("click", (e) => {
                e.stopPropagation();
                document.getElementById(`options-popup-${directory.name}`)?.classList.add("hidden");
                document.getElementById(`delete-popup-${directory.name}`)?.classList.remove("hidden");
            });

            pastBtn?.addEventListener("click", (e) => {
                e.stopPropagation();

            });

            const closeRenameBtn = folderContainer.querySelector(".close-rename");
            const closeDeleteBtn = folderContainer.querySelector(".close-delete");

            closeRenameBtn?.addEventListener("click", (event) => {
                event.stopPropagation();
                document.getElementById(`rename-popup-${directory.name}`)?.classList.add('hidden');
            });

            closeDeleteBtn?.addEventListener("click", (event) => {
                event.stopPropagation();
                document.getElementById(`delete-popup-${directory.name}`)?.classList.add('hidden');
            });
            // Append to the container
            container.appendChild(folderContainer);
        }
    });

}
// folders render func end


// file section code start
function clearFileContainer() {
    document.querySelector('.file-container').innerHTML = '';
}
// file section code end

// Add Drag and Drop functionality for file upload start
// function enableDragAndDrop() {
//     const dropArea = document.querySelector(".file-container");

//     dropArea.addEventListener("dragover", (event) => {
//         event.preventDefault();
//         dropArea.classList.add("drag-over");
//     });

//     dropArea.addEventListener("dragleave", () => {
//         dropArea.classList.remove("drag-over");
//     });

//     dropArea.addEventListener("drop", (event) => {
//         event.preventDefault();
//         dropArea.classList.remove("drag-over");

//         const files = event.dataTransfer.files;
//         if (files.length > 0) {
//             handleFileUpload(files);
//         }
//     });
// }

// enableDragAndDrop();


// Handle file upload
function handleFileUpload(files) {
    let formData = new FormData();
    for (let file of files) {
        formData.append("files", file);
    }

    formData.append("currentPath", currentDirectoryPath);

    fetch("/upload", {
        method: "POST",
        body: formData
    })
        .then(response => response.json())
        .then(dataa => {
            if (dataa.error) {
                showCustomAlert("Error: " + dataa.error);
            } else {
                loadDirectoriess();
                //alert("Files uploaded successfully!");
                // Refresh or update file container after upload

                setTimeout(() => {
                    const Dir = data.children.find(child => child.name === clicked_directory && child.type === "directory");

                    if (Dir) {
                        renderChildrenn(Dir.children, Dir.name, Dir.full_path);
                    } else {
                        console.log(dName, "directory nahi mili.");
                    }
                }, 3000);
            }
        })
        .catch(error => {
            console.error("Upload failed:", error);
        });
}

// Create a file input for manual selection
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.multiple = true;
fileInput.style.display = "none";
fileInput.addEventListener("change", (event) => {
    handleFileUpload(event.target.files);
});

// Event listener for the "Upload File" button
const uploadButton = document.querySelector("#uploadButton"); // Button to trigger file selection
uploadButton.addEventListener("click", () => {
    fileInput.click(); // Simulate a click on the hidden file input
});

// Add Drag and Drop functionality for file upload end



function getFileIconn(file) {
    const nameParts = file.name.toLowerCase().split('.');

    // Ensure at least one extension exists
    if (nameParts.length < 2) {
        return "static/images/file.png"; // Default for files without extensions
    }

    // Extract last and second-last extensions
    const lastExt = nameParts.pop(); // Last extension
    const secondLastExt = nameParts.length > 0 ? nameParts.pop() : null; // Second-last extension (if available)

    // Define file type categories
    const videoExtensions = ["mp4", "avi", "mov", "mkv", "flv", "wmv", "webm"];
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "tiff"];
    const audioExtensions = ["mp3", "wav", "ogg", "flac", "aac"];
    const documentExtensions = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"];
    const encryptionExtensions = ["rsa", "ecc", "aes", "kem", "kpke", "ltm", "tn"];
    console.log("lastExt", lastExt)
    // Check if the last extension is an encryption type
    if (encryptionExtensions.includes(lastExt)) {
        return "static/images/enc.png";
    }

    // If no encryption extension, determine the correct file type
    const fileExtension = lastExt;

    if (videoExtensions.includes(fileExtension) || imageExtensions.includes(fileExtension)) {
        return `data:image/png;base64,${file.thumbnail_base64}`;
    } else if (documentExtensions.includes(fileExtension)) {
        return "static/images/doc.png";
    } else if (audioExtensions.includes(fileExtension)) {
        return "static/images/music.png";
    } else {
        return "static/images/file.png"; // Default file icon
    }
}

const videoExtensions = ['.mp4', '.avi', '.mkv', '.mov', '.flv', '.webm'];
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a'];
const documentExtensions = ['.pdf', '.docx', '.txt'];
function getFileActionButtonn(file) {
    let filePath = file.path;
    let fileName = file.name.toLowerCase();

    if (videoExtensions.some(ext => fileName.endsWith(ext))) {
        return `
            <button class="popup-option" onclick="playVideo('${filePath}')">
                <img src="static/images/play.png" alt="Play">
                <span>Play Video</span>
            </button>
        `;
    }

    if (imageExtensions.some(ext => fileName.endsWith(ext))) {
        return `
            <button class="popup-option" onclick="viewImage('${filePath}')">
                <img src="static/images/Image Icon.png" alt="View">
                <span>View Image</span>
            </button>
        `;
    }

    if (audioExtensions.some(ext => fileName.endsWith(ext))) {
        return `
            <button class="popup-option" onclick="playAudio('${filePath}')">
                <img src="static/images/play.png" alt="Play">
                <span>Play Audio</span>
            </button>
        `;
    }

    if (documentExtensions.some(ext => fileName.endsWith(ext))) {
        return `
            <button class="popup-option" onclick="viewDocument('${filePath}')">
              <img src="static/images/Documents new Icon.png" alt="View">
                <span>View Document</span>
            </button>
        `;
    }

    return ''; // No button if it's an unsupported file type
}

// Function to replace the entire section with ONLY the clicked folder's children
function renderChildrenn(children, directoryName, directoryPath) {
    currentDirectoryPath = directoryPath;
    console.log("currentDirectoryPath", currentDirectoryPath)
    clearFileContainer()
    const container = document.querySelector('.folder-section');
    container.style.display = 'none'; // Clear everything

    const storage = document.querySelector('.storage-info');
    storage.style.display = "none";

    const btnContainer = document.querySelector('.button-container');
    btnContainer.style.display = "none";

    const network = document.querySelector('.network-status');
    network.style.display = "none";

    const fileContainer = document.querySelector('.file-container');
    fileContainer.style.display = 'block';
    document.getElementById('uploadBtnWrapper').style.display = 'block';
    document.querySelector('.upload-container').classList.add('show');

    // Add class to make footer fixed
    document.querySelector('.heading-container').classList.add("fixed-footer");

    document.querySelector('.logoo').innerText = directoryName;

    let img = document.querySelector('.logooo img');
    

    // Change the image source
    img.src = "static/images/back.png";

    // Set width and height styles
    img.style.width = "25px";
    img.style.height = "auto";
    img.style.cursor = "pointer";

    let hf = document.querySelector('.hf');
    hf.style.display = "none";

    console.log("img",img)

    // Add click event listener
    img.addEventListener("click", function () {
        hf.style.display = "block";
        const container = document.querySelector('.folder-section');
        container.style.display = 'block'; // Show the folder section

        btnContainer.style.display = "flex";

        storage.style.display = 'block'; // Show the folder section
        network.style.display = "block";

        const fileContainer = document.querySelector('.file-container');
        fileContainer.style.display = 'none'; // Hide file container
        document.getElementById('uploadBtnWrapper').style.display = 'none';
        document.querySelector('.upload-container').classList.remove('show');



        document.querySelector('.logoo').innerText = ""; // Clear text

        // Change image source
        // img.src = "static/images/Group 21.png";
        // img.style.width = "60px";
        // img.style.height = "auto";
        fileContainer.innerHTML = "";

        // Remove fixed footer class
        document.querySelector('.heading-container').classList.remove("fixed-footer");

        // ✅ Re-run user profile update
        updateUserProfile(); // <--- ADD THIS LINE


    });

    if (!children || children.length === 0) {
        fileContainer.innerHTML = "<p>No files or folders inside.</p>";
        return;
    }



    children.forEach((file) => {
        const fileDiv = document.createElement("div");
        fileDiv.classList.add("folder");



        fileDiv.innerHTML = `
<div class="folder-content" style="display: flex; justify-content: space-between; align-items: center; position: relative;">
    <div class="folder-icon">
        <img src="${getFileIconn(file)}" alt="${file.name}" style="width: 56px; height: 56px; object-fit: cover;" />
    </div>
    <div style="flex: 1; padding-right: 20px;">
        <div class="folder-name" style="margin-left: 10px;">${file.name}</div>
        <div class="folder-separate-image">
            <img src="static/images/file.png" alt="Separator Image" />
        </div>
        <div class="folder-time" style="margin-top:-45px; margin-left: 10px;">${file.dateTime}</div>
    </div>
    <div class="kebab-menu">
        <button type="button" class="btnnnn">
    <img src="static/images/3_dots.png" alt="dots" class="dots-img">
</button>
        <div class="popup">
            <div class="popup-content">
                <span class="close">&times;</span>
                ${getFileActionButtonn(file)}
               <!--  <button class="popup-option" data-bs-toggle="modal" data-bs-target="#myModal">
                    <img src="static/images/share.png" alt="Share">
                    <span>Share</span>
                </button> -->
                <button class="popup-option" data-bs-toggle="modal" data-bs-target="#renameModal" onclick="setCurrentFile('${file.path}', '${directoryName}')">
                    <img src="static/images/rename1.png" alt="Rename">
                    <span>Rename</span>
                </button>
                <button class="popup-option" data-bs-toggle="modal" data-bs-target="#deleteModal" onclick="setCurrentFile('${file.path}', '${directoryName}')">
                    <img src="static/images/delete.png" alt="Delete">
                    <span>Delete</span>
                </button>

                <!-- Encryption Dropdown -->
                <div class="dropdown">
                    <button class="popup-option dropdown-btn">
                        <img src="static/images/lock.png" alt="Encryption">
                        <span>Encryption</span>
                        <span class="select-btn" onclick="toggleDropdown(event)">Select</span> 
                    </button>

                    <div class="dropdown-content">
                       <button onclick="handleAES(&quot;${file.path}&quot;, &quot;${directoryName}&quot;)">AES</button>
                      <button onclick="handleRSA(&quot;${file.path}&quot;, &quot;${directoryName}&quot;)">RSA</button>
                      <button onclick="handleECC(&quot;${file.path}&quot;, &quot;${directoryName}&quot;)">ECC</button>
                      <button onclick="handleKEM(&quot;${file.path}&quot;, &quot;${directoryName}&quot;)">KEM</button>
                      <button onclick="handleKPKE(&quot;${file.path}&quot;, &quot;${directoryName}&quot;)">KPKE</button>
                      <button onclick="handleLTM(&quot;${file.path}&quot;, &quot;${directoryName}&quot;)">LTM</button>
                      <button onclick="handleTN(&quot;${file.path}&quot;, &quot;${directoryName}&quot;)">TN</button>
 
                    </div>
                </div>

                <button class="popup-option" data-bs-toggle="modal" data-bs-target="#decryptModal" onclick="setCurrentFile(&quot;${file.path}&quot;, &quot;${directoryName}&quot;)">
                    <img src="static/images/delete.png" alt="Decrypt">
                    <span>Decrypt</span>
                </button>

               <!-- <button class="popup-option">
                    <img src="static/images/copy.png" alt="Copy">
                    <span>Copy</span>
                </button> -->
            </div>
        </div>
    </div>
</div>

    `;

        fileContainer.appendChild(fileDiv);





    });
}

function toggleDropdown(event) {
    event.stopPropagation();
    let dropdown = event.target.closest('.dropdown');
    dropdown.classList.toggle('active');
}

function openEncryptionModal(encType) {
    let modalId = `#${encType}Modal`;
    let modalElement = document.querySelector(modalId);
    if (modalElement) {
        $(modalElement).modal('show'); // Bootstrap Modal Open
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        if (!dropdown.contains(event.target)) {
            dropdown.classList.remove('active');
        }
    });
});




// // Array of 10 random users with dummy data
// const users = [
//     { id: 1, username: 'John Doe', image: '../static/images/david.jpg' },
//     { id: 2, username: 'Jane Smith', image: '../static/images/elza.jpg' },
//     { id: 3, username: 'Alice Johnson', image: '../static/images/em.jpg' },
//     { id: 4, username: 'Bob Brown', image: '../static/images/hammad.jpg' },
//     { id: 5, username: 'Charlie Davis', image: '../static/images/mi.jpg' },
//     { id: 6, username: 'Eve Miller', image: '../static/images/miic.jpg' },
//     { id: 7, username: 'David Wilson', image: '../static/images/patri.jpg' },
//     { id: 8, username: 'Emily Moore', image: '../static/images/pf.jpeg' },
//     { id: 9, username: 'Frank Taylor', image: '../static/images/rich.jpg' },
//     { id: 10, username: 'Grace Lee', image: '../static/images/talking.png' },
//     { id: 11, username: 'Frank Taylor', image: '../static/images/rich.jpg' },
//     { id: 12, username: 'Frank Taylor', image: '../static/images/rich.jpg' },
//     { id: 13, username: 'Frank Taylor', image: '../static/images/rich.jpg' },
//     { id: 14, username: 'Frank Taylor', image: '../static/images/rich.jpg' },
//     { id: 15, username: 'Frank Taylor', image: '../static/images/rich.jpg' },
//     { id: 16, username: 'Frank Taylor', image: '../static/images/rich.jpg' },
//     { id: 17, username: 'Frank Taylor', image: '../static/images/rich.jpg' },
//     { id: 18, username: 'Frank Taylor', image: '../static/images/rich.jpg' },
//     { id: 19, username: 'Frank Taylor', image: '../static/images/rich.jpg' },
//     { id: 20, username: 'Frank Taylor', image: '../static/images/rich.jpg' },
// ];

// Get all users function start
const API_BASE_URL = 'https://enigmakey.tech/serv';

const getAllUsers = async () => {
    const token = localStorage.getItem('access_token')
    try {
        const userName = 'Ahsan';

        const response = await fetch(`${API_BASE_URL}/get-all-users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        allUsers.push(...data.users)

        const filteredUsers = data?.users?.filter(
            user => user.id !== userId
        );
        // && user.username !== 'Admin'

        return filteredUsers;
    } catch (error) {
        console.error('getAllUsers error', error);
    }
};
// Get all users function end

// Function to generate user elements and display them
async function generateUserList() {
    const users = await getAllUsers(); // API call to fetch users
    if (!users || users.length === 0) return;

    const userListContainer = document.getElementById('userList');
    userListContainer.innerHTML = ""; // Clear existing list

    users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.classList.add('row', 'align-items-center', 'user-item');
        userDiv.dataset.userId = user.id;


        userDiv.innerHTML = `
        <div class="col-auto">
            <img src="${user.profile_image ? `https://enigmakey.tech/serv/files/${user.profile_image}` : `../static/chatimg/bydefaultimg.png`}" alt="Image" class="img-fluid">
        </div>
        <div class="col">
            <p class="user-name">${user.username}</p>
        </div>
        <div class="col-auto">
            <button class="btnnn send-btn">Send</button>
        </div>
    `;
        userDiv.addEventListener('click', () => selectUser(userDiv));
        userListContainer.appendChild(userDiv);
    });
}

// Function to select a user and show the Send button
function selectUser(userDiv) {
    // Deselect all users
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('selected');
    });

    // Select the clicked user
    userDiv.classList.add('selected');
}

// Function to show alert when the Send button is clicked
function sendAlert(username) {
    showCustomAlert(`You clicked on ${username}`);
}

// Call the function to generate the user list when the modal is shown
// Call the function to generate the user list when the modal is shown (Only Once)
document.getElementById('myModal').addEventListener('shown.bs.modal', function () {
    const userListContainer = document.getElementById('userList');
    if (userListContainer.children.length === 0) { // Prevent duplicate users
        generateUserList();
    }
});

// Close modal properly and restore page functionality
document.addEventListener('hidden.bs.modal', function () {
    document.body.classList.remove('modal-open'); // Remove Bootstrap's modal-open class
    document.body.style.overflow = ''; // Restore scrolling

    // Remove any extra modal backdrop
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.remove();
    });

    // 🔥 Clean user list when modal closes (optional)
    document.getElementById('userList').innerHTML = '';
});

document.addEventListener("DOMContentLoaded", function () {
    const statusDivs = document.querySelectorAll(".status");

    statusDivs.forEach(status => {
        if (status.textContent.includes("Connected")) {
            status.classList.remove("enigma_d"); // Remove red
            status.classList.add("enigma"); // Add green
        }
    });
});



function handleRename() {
    const newName = document.getElementById('renameInput').value.trim(); // Get the new name and trim spaces

    if (!currentFileName) {
        showCustomAlert("No file selected for renaming!");
        return;
    }

    if (!newName) {
        showCustomAlert("Please enter a new name.");
        return;
    }

    // Show loader and prevent scrolling
    document.getElementById("loader").style.display = "flex";
    document.body.style.overflow = "hidden";

    // Extract directory, old filename, and extension
    const lastSlashIndex = currentFileName.lastIndexOf("/");
    const lastDotIndex = currentFileName.lastIndexOf(".");

    if (lastDotIndex === -1 || lastSlashIndex === -1) {
        showCustomAlert("Invalid file path!");
        return;
    }

    const directory = currentFileName.substring(0, lastSlashIndex + 1); // e.g., "/Movies/"
    const fileExtension = currentFileName.substring(lastDotIndex); // e.g., ".mp4"

    // New full path: directory + newName + original extension
    const newFilePath = directory + newName + fileExtension; // e.g., "/Movies/new_dj_usb.mp4"

    // Construct the API request payload
    const requestData = {
        path: currentFileName,  // Original full file path
        new_name: newFilePath // Full new file path
    };

    // Make the API request
    fetch('/rename', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(response => response.json())
        .then(dataa => {
            if (dataa.error) {
                showCustomAlert(`Error: ${dataa.error}`);
                console.error(`Rename Error: ${dataa.error}`);
            } else {
                //showCustomAlert(`Renamed successfully to: ${newFilePath}`);
                console.log(`Renamed from ${dataa.old_path} to ${dataa.new_path}`);

                loadDirectoriess();

                setTimeout(() => {

                    const Dir = data.children.find(child => child.name === dName && child.type === "directory");

                    if (Dir) {
                        renderChildrenn(Dir.children, Dir.name, Dir.full_path);
                    } else {
                        console.log("Movies directory nahi mili.");
                    }

                }, 3000); // Wait for 3 seconds (3000 milliseconds)
                var modalElement = document.getElementById('renameModal');
                var modal = bootstrap.Modal.getInstance(modalElement);
                modal.hide();


            }
        })
        .catch(error => {
            console.error("Error renaming file:", error);
            showCustomAlert("Failed to rename the file. Please try again.");
        }).finally(() => {
            // Hide loader after processing
            document.getElementById("loader").style.display = "none";
            document.body.style.overflow = "auto"; // Restore scrolling
        });
}



function handleAES(fileName, drName) {
    console.log("handleAES")
    currentFileName = fileName;
    dName = drName;
    console.log("Selected File:", currentFileName, "Current Dir: ", dName);

    if (currentFileName) {
        console.log(`Encrypting file: ${currentFileName}`);
        // Show loader and prevent scrolling
        document.getElementById("loader").style.display = "flex";
        document.body.style.overflow = "hidden";
        const requestData = {
            file_path: currentFileName,  // Original full file path
        };

        // Make the API request
        fetch('/encrypt_aes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
            .then(response => response.json())
            .then(dataa => {
                if (dataa.error) {
                    showCustomAlert(`Error: ${dataa.error}`);
                    console.error(`Encryption Error: ${dataa.error}`);
                } else {
                    showCustomAlert(`${currentFileName} Encryptrd with AES Successfully`);
                    console.log(`${currentFileName} Encryptrd with AES Successfully`);

                    loadDirectoriess();

                    setTimeout(() => {
                        const Dir = data.children.find(child => child.name === dName && child.type === "directory");

                        if (Dir) {
                            renderChildrenn(Dir.children, Dir.name, Dir.full_path);
                        } else {
                            console.log("Movies directory nahi mili.");
                        }
                    }, 3000); // Wait for 3 seconds (3000 milliseconds)

                    //const renameModal = new bootstrap.Modal(document.getElementById('renameModal'));
                    //renameModal.hide();
                    var modalElement = document.getElementById('AESModal');
                    var modal = bootstrap.Modal.getInstance(modalElement);
                    modal.hide();

                }
            })
            .catch(error => {
                console.error("Error deleting file:", error);
                //alert("Failed to delete the file. Please try again.");
            }).finally(() => {
                // Hide loader after processing
                document.getElementById("loader").style.display = "none";
                document.body.style.overflow = "auto"; // Restore scrolling
            });
    } else {
        showCustomAlert("No file selected for deletion!");
    }

    // Close the modal
    //const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    //deleteModal.hide();

    //$('#deleteModal').modal('hide');

}

function handleRSA(fileName, drName) {
    console.log("handleRSA");
    currentFileName = fileName;
    dName = drName;
    console.log("Selected File:", currentFileName, "Current Dir: ", dName);

    if (currentFileName) {
        console.log(`Encrypting file: ${currentFileName}`);

        // Show loader and prevent scrolling
        document.getElementById("loader").style.display = "flex";
        document.body.style.overflow = "hidden";

        const requestData = { file_path: currentFileName };

        fetch('/encrypt_rsa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        })
            .then(response => response.json())
            .then(dataa => {
                if (dataa.error) {
                    showCustomAlert(`Error: ${dataa.error}`);
                    console.error(`Encryption Error: ${dataa.error}`);
                } else {
                    showCustomAlert(`${currentFileName} Encrypted with RSA Successfully`);
                    console.log(`${currentFileName} Encrypted with RSA Successfully`);

                    loadDirectoriess();

                    setTimeout(() => {
                        const Dir = data.children.find(child => child.name === dName && child.type === "directory");

                        if (Dir) {
                            renderChildrenn(Dir.children, Dir.name, Dir.full_path);
                        } else {
                            console.log(`${dName} directory nahi mili.`);
                        }
                    }, 3000);

                    // Hide Modal
                    var modalElement = document.getElementById('RSAModal');
                    var modal = bootstrap.Modal.getInstance(modalElement);
                    modal.hide();
                }
            })
            .catch(error => {
                console.error("Error encrypting file:", error);
            })
            .finally(() => {
                // Hide loader after processing
                document.getElementById("loader").style.display = "none";
                document.body.style.overflow = "auto"; // Restore scrolling
            });
    } else {
        showCustomAlert("No file selected for encryption!");
    }
}


function handleECC(fileName, drName) {
    console.log("handleECC")
    currentFileName = fileName;
    dName = drName;
    console.log("Selected File:", currentFileName, "Current Dir: ", dName);

    if (currentFileName) {
        console.log(`Encrypting file: ${currentFileName}`);

        // Show loader and prevent scrolling
        document.getElementById("loader").style.display = "flex";
        document.body.style.overflow = "hidden";


        const requestData = {
            file_path: currentFileName,  // Original full file path
        };

        // Make the API request
        fetch('/encrypt_ecc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
            .then(response => response.json())
            .then(dataa => {
                if (dataa.error) {
                    showCustomAlert(`Error: ${dataa.error}`);
                    console.error(`Encryption Error: ${dataa.error}`);
                } else {
                    showCustomAlert(`${currentFileName} Encryptrd with ECC Successfully`);
                    console.log(`${currentFileName} Encryptrd with ECC Successfully`);

                    loadDirectoriess();

                    setTimeout(() => {
                        const Dir = data.children.find(child => child.name === dName && child.type === "directory");

                        if (Dir) {
                            renderChildrenn(Dir.children, Dir.name, Dir.full_path);
                        } else {
                            console.log("Movies directory nahi mili.");
                        }
                    }, 3000); // Wait for 3 seconds (3000 milliseconds)

                    //const renameModal = new bootstrap.Modal(document.getElementById('renameModal'));
                    //renameModal.hide();
                    var modalElement = document.getElementById('ECCModal');
                    var modal = bootstrap.Modal.getInstance(modalElement);
                    modal.hide();

                }
            })
            .catch(error => {
                console.error("Error encrypting file:", error);
                //alert("Failed to delete the file. Please try again.");
            })
            .finally(() => {
                // Hide loader after processing
                document.getElementById("loader").style.display = "none";
                document.body.style.overflow = "auto"; // Restore scrolling
            });

    } else {
        showCustomAlert("No file selected for deletion!");
    }

    // Close the modal
    //const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    //deleteModal.hide();

    //$('#deleteModal').modal('hide');

}

function handleKEM(fileName, drName) {
    console.log("handleKEM")
    currentFileName = fileName;
    dName = drName;
    console.log("Selected File:", currentFileName, "Current Dir: ", dName);

    if (currentFileName) {
        console.log(`Encrypting file: ${currentFileName}`);

        // Show loader and prevent scrolling
        document.getElementById("loader").style.display = "flex";
        document.body.style.overflow = "hidden";


        const requestData = {
            file_path: currentFileName,  // Original full file path
        };

        // Make the API request
        fetch('/encrypt_kem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
            .then(response => response.json())
            .then(dataa => {
                if (dataa.error) {
                    showCustomAlert(`Error: ${dataa.error}`);
                    console.error(`Encryption Error: ${dataa.error}`);
                } else {
                    showCustomAlert(`${currentFileName} Encryptrd with KEM Successfully`);
                    console.log(`${currentFileName} Encryptrd with KEM Successfully`);

                    loadDirectoriess();

                    setTimeout(() => {
                        const Dir = data.children.find(child => child.name === dName && child.type === "directory");

                        if (Dir) {
                            renderChildrenn(Dir.children, Dir.name, Dir.full_path);
                        } else {
                            console.log("Movies directory nahi mili.");
                        }
                    }, 3000); // Wait for 3 seconds (3000 milliseconds)

                    //const renameModal = new bootstrap.Modal(document.getElementById('renameModal'));
                    //renameModal.hide();
                    var modalElement = document.getElementById('KEMModal');
                    var modal = bootstrap.Modal.getInstance(modalElement);
                    modal.hide();

                }
            })
            .catch(error => {
                console.error("Error encrypting file:", error);
                //alert("Failed to delete the file. Please try again.");
            })
            .finally(() => {
                // Hide loader after processing
                document.getElementById("loader").style.display = "none";
                document.body.style.overflow = "auto"; // Restore scrolling
            });

    } else {
        showCustomAlert("No file selected for deletion!");
    }

    // Close the modal
    //const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    //deleteModal.hide();

    //$('#deleteModal').modal('hide');

}
function handleKPKE(fileName, drName) {
    console.log("handleKPKE")
    currentFileName = fileName;
    dName = drName;
    console.log("Selected File:", currentFileName, "Current Dir: ", dName);

    if (currentFileName) {
        console.log(`Encrypting file: ${currentFileName}`);

        // Show loader and prevent scrolling
        document.getElementById("loader").style.display = "flex";
        document.body.style.overflow = "hidden";


        const requestData = {
            file_path: currentFileName,  // Original full file path
        };

        // Make the API request
        fetch('/encrypt_kpke', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
            .then(response => response.json())
            .then(dataa => {
                if (dataa.error) {
                    showCustomAlert(`Error: ${dataa.error}`);
                    console.error(`Encryption Error: ${dataa.error}`);
                } else {
                    showCustomAlert(`${currentFileName} Encryptrd with KPKE Successfully`);
                    console.log(`${currentFileName} Encryptrd with KPKE Successfully`);

                    loadDirectoriess();

                    setTimeout(() => {
                        const Dir = data.children.find(child => child.name === dName && child.type === "directory");

                        if (Dir) {
                            renderChildrenn(Dir.children, Dir.name, Dir.full_path);
                        } else {
                            console.log("Movies directory nahi mili.");
                        }
                    }, 3000); // Wait for 3 seconds (3000 milliseconds)

                    //const renameModal = new bootstrap.Modal(document.getElementById('renameModal'));
                    //renameModal.hide();
                    var modalElement = document.getElementById('KPKEModal');
                    var modal = bootstrap.Modal.getInstance(modalElement);
                    modal.hide();

                }
            })
            .catch(error => {
                console.error("Error encrypting file:", error);
                //alert("Failed to delete the file. Please try again.");
            })
            .finally(() => {
                // Hide loader after processing
                document.getElementById("loader").style.display = "none";
                document.body.style.overflow = "auto"; // Restore scrolling
            });

    } else {
        showCustomAlert("No file selected for deletion!");
    }

    // Close the modal
    //const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    //deleteModal.hide();

    //$('#deleteModal').modal('hide');

}

function handleLTM(fileName, drName) {
    console.log("handleLTM")
    currentFileName = fileName;
    dName = drName;
    console.log("Selected File:", currentFileName, "Current Dir: ", dName);

    if (currentFileName) {
        console.log(`Encrypting file: ${currentFileName}`);

        // Show loader and prevent scrolling
        document.getElementById("loader").style.display = "flex";
        document.body.style.overflow = "hidden";


        const requestData = {
            file_path: currentFileName,  // Original full file path
        };

        // Make the API request
        fetch('/encrypt_ltm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
            .then(response => response.json())
            .then(dataa => {
                if (dataa.error) {
                    showCustomAlert(`Error: ${dataa.error}`);
                    console.error(`Encryption Error: ${dataa.error}`);
                } else {

                    console.log(`${currentFileName} Encryptrd with LTM Successfully`);

                    loadDirectoriess();

                    setTimeout(() => {
                        const Dir = data.children.find(child => child.name === dName && child.type === "directory");

                        if (Dir) {
                            renderChildrenn(Dir.children, Dir.name, Dir.full_path);
                        } else {
                            console.log("Movies directory nahi mili.");
                        }
                    }, 3000); // Wait for 3 seconds (3000 milliseconds)

                    //const renameModal = new bootstrap.Modal(document.getElementById('renameModal'));
                    //renameModal.hide();
                    var modalElement = document.getElementById('LTMModal');
                    var modal = bootstrap.Modal.getInstance(modalElement);
                    modal.hide();

                }
            })
            .catch(error => {
                console.error("Error encrypting file:", error);
                //alert("Failed to delete the file. Please try again.");
            })
            .finally(() => {
                // Hide loader after processing
                document.getElementById("loader").style.display = "none";
                document.body.style.overflow = "auto"; // Restore scrolling
            });

    } else {
        showCustomAlert("No file selected for deletion!");
    }

    // Close the modal
    //const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    //deleteModal.hide();

    //$('#deleteModal').modal('hide');

}

function handleTN(fileName, drName) {
    console.log("handleTN")
    currentFileName = fileName;
    dName = drName;
    console.log("Selected File:", currentFileName, "Current Dir: ", dName);

    if (currentFileName) {
        console.log(`Encrypting file: ${currentFileName}`);

        // Show loader and prevent scrolling
        document.getElementById("loader").style.display = "flex";
        document.body.style.overflow = "hidden";


        const requestData = {
            file_path: currentFileName,  // Original full file path
        };

        // Make the API request
        fetch('/encrypt_tn', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
            .then(response => response.json())
            .then(dataa => {
                if (dataa.error) {
                    showCustomAlert(`Error: ${dataa.error}`);
                    console.error(`Encryption Error: ${dataa.error}`);
                } else {
                    showCustomAlert(`${currentFileName} Encryptrd with TN Successfully`);
                    console.log(`${currentFileName} Encryptrd with TN Successfully`);

                    loadDirectoriess();

                    setTimeout(() => {
                        const Dir = data.children.find(child => child.name === dName && child.type === "directory");

                        if (Dir) {
                            renderChildrenn(Dir.children, Dir.name, Dir.full_path);
                        } else {
                            console.log("Movies directory nahi mili.");
                        }
                    }, 3000); // Wait for 3 seconds (3000 milliseconds)

                    //const renameModal = new bootstrap.Modal(document.getElementById('renameModal'));
                    //renameModal.hide();
                    var modalElement = document.getElementById('TNModal');
                    var modal = bootstrap.Modal.getInstance(modalElement);
                    modal.hide();

                }
            })
            .catch(error => {
                console.error("Error encrypting file:", error);
                //alert("Failed to delete the file. Please try again.");
            })
            .finally(() => {
                // Hide loader after processing
                document.getElementById("loader").style.display = "none";
                document.body.style.overflow = "auto"; // Restore scrolling
            });

    } else {
        showCustomAlert("No file selected for deletion!");
    }

    // Close the modal
    //const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    //deleteModal.hide();

    //$('#deleteModal').modal('hide');

}

function handleDecrypt() {

    console.log("Selected File:", currentFileName, "Current Dir: ", dName);

    var modalElement = document.getElementById('decryptModal');
    var modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();


    if (currentFileName) {
        console.log(`Decrypting file: ${currentFileName}`);

        // Show loader and prevent scrolling
        document.getElementById("loader").style.display = "flex";
        document.body.style.overflow = "hidden";


        const requestData = {
            file_path: currentFileName,  // Original full file path
        };

        // Make the API request
        fetch('/decrypt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
            .then(response => response.json())
            .then(dataa => {
                if (dataa.error) {
                    showCustomAlert(`Error: ${dataa.error}`);
                    console.error(`Encryption Error: ${dataa.error}`);
                } else {
                    showCustomAlert(`${currentFileName} Decrypted Successfully`);
                    console.log(`${currentFileName} Decrypted Successfully`);

                    loadDirectoriess();

                    setTimeout(() => {
                        const Dir = data.children.find(child => child.name === dName && child.type === "directory");

                        if (Dir) {
                            renderChildrenn(Dir.children, Dir.name, Dir.full_path);
                        } else {
                            console.log("Movies directory nahi mili.");
                        }
                    }, 3000); // Wait for 3 seconds (3000 milliseconds)

                    //const renameModal = new bootstrap.Modal(document.getElementById('renameModal'));
                    //renameModal.hide();
                }
            })
            .catch(error => {
                console.error("Error encrypting file:", error);
                //alert("Failed to delete the file. Please try again.");
            })
            .finally(() => {
                // Hide loader after processing
                document.getElementById("loader").style.display = "none";
                document.body.style.overflow = "auto"; // Restore scrolling
            });

    } else {
        showCustomAlert("No file selected for deletion!");
    }

    // Close the modal
    //const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    //deleteModal.hide();

    //$('#deleteModal').modal('hide');

}

function handleDelete() {
    var modalElement = document.getElementById('deleteModal');
    var modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();
    if (currentFileName) {
        // alert(`Deleted: ${currentFileName}`);
        console.log(`Deleting file: ${currentFileName}`);

        const requestData = {
            file_path: currentFileName,  // Original full file path
        };

        // Show loader and prevent scrolling
        document.getElementById("loader").style.display = "flex";
        document.body.style.overflow = "hidden";

        // Make the API request
        fetch('/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
            .then(response => response.json())
            .then(dataa => {
                if (dataa.error) {
                    // alert(`Error: ${dataa.error}`);
                    console.error(`Rename Error: ${dataa.error}`);
                } else {
                    showCustomAlert(`${currentFileName} Deleted Successfully`);
                    console.log(`${currentFileName} Deleted Successfully`);

                    loadDirectoriess();

                    setTimeout(() => {
                        const Dir = data.children.find(child => child.name === dName && child.type === "directory");

                        if (Dir) {
                            renderChildrenn(Dir.children, Dir.name, Dir.full_path);
                        } else {
                            console.log("Movies directory nahi mili.");
                        }
                    }, 3000); // Wait for 3 seconds (3000 milliseconds)

                    //const renameModal = new bootstrap.Modal(document.getElementById('renameModal'));
                    //renameModal.hide();

                }
            })
            .catch(error => {
                console.error("Error deleting file:", error);
                //alert("Failed to delete the file. Please try again.");
            }).finally(() => {
                // Hide loader after processing
                document.getElementById("loader").style.display = "none";
                document.body.style.overflow = "auto"; // Restore scrolling
            });

    } else {
        showCustomAlert("No file selected for deletion!");
    }

    // Close the modal
    //const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    //deleteModal.hide();

    //$('#deleteModal').modal('hide');

}


function Past(folderPath) {
    console.log("folderName", folderPath);

}

function folderDelete(folderPath) {
    console.log("folderPath", folderPath);

    //if (!confirm("Are you sure you want to delete this folder?")) return;

    fetch('/delete-folder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            file_path: `/${folderPath}`   // ⚠️ Make sure this is relative path from USB root
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.message) {
                showCustomAlert(data.message);
                location.reload(); // ✅ Refresh after deletion
            } else {
                showCustomAlert("❌ Delete failed: " + data.error);
            }
        })
        .catch(error => {
            console.error("❌ Error deleting folder:", error);
            showCustomAlert("Something went wrong!");
        });
}


// function folderRename(oldfoldername, newfoldername) {
//     console.log("Old Folder Name:", oldfoldername);
//     console.log("New Folder Name:", newfoldername);

//     if (!newfoldername.trim()) {
//         alert("Please enter a new name!");
//         return;
//     }

//     // Call API or rename logic here...
// }


function folderRename(oldfoldername, newfoldername) {
    console.log("Old Folder Name:", oldfoldername);
    console.log("New Folder Name:", newfoldername);

    if (!newfoldername.trim()) {
        showCustomAlert("Please enter a new name!");
        return;
    }

    // Send POST request to Flask API
    fetch('/rename', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            path: `/${oldfoldername}`, // Replace `/rootpath/` with actual relative path to folder
            new_name: newfoldername
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'File renamed successfully') {
                showCustomAlert('Renamed successfully!');
                location.reload(); // Refresh to show updated names
            } else {
                console.error(data.error);
                showCustomAlert("Rename failed: " + data.error);
            }
        })
        .catch(error => {
            console.error("Error renaming folder:", error);
            showCustomAlert("Something went wrong!");
        });
}




// Asad code
// function setCurrentFile(fileName, drName) {
//     currentFileName = fileName;
//     dName = drName;
//     console.log("Selected File:", currentFileName, "Current Dir: ", dName);
// }

// Abdullah code
function setCurrentFile(fileName, drName) {
    currentFileName = fileName;
    dName = drName;
    console.log("Selected File:", currentFileName, "Current Dir: ", dName);

    const lastSlash = fileName.lastIndexOf("/");
    const fileNameWithExt = fileName.substring(lastSlash + 1);
    const dotIndex = fileNameWithExt.lastIndexOf(".");
    const fileNameOnly = dotIndex !== -1 ? fileNameWithExt.substring(0, dotIndex) : fileNameWithExt;

    // ✅ Set value for rename modal input
    const renameInput = document.getElementById("renameInput");
    if (renameInput) {
        renameInput.value = fileNameOnly;
    }

    // ✅ Set name in delete confirmation modal
    const deleteNameSpan = document.getElementById("fileToDeleteName");
    if (deleteNameSpan) {
        deleteNameSpan.textContent = fileNameWithExt;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const createFolderBtn = document.getElementById("createFolderBtn");
    const fileContainer = document.querySelector(".file-container");
    const folderSection = document.querySelector(".folder-section");
    const logoImg = document.querySelector(".logo img");

    function toggleCreateFolderButton() {
        if (fileContainer.style.display === "block") {
            createFolderBtn.style.display = "none"; // Hide button when file section is visible
        } else {
            createFolderBtn.style.display = "block"; // Show button when folder section is visible
        }
    }

    // Observe folder and file section changes
    const observer = new MutationObserver(toggleCreateFolderButton);
    observer.observe(fileContainer, { attributes: true, attributeFilter: ["style"] });

    // Ensure button hides when a folder is clicked
    document.querySelectorAll(".folder-click").forEach(folder => {
        folder.addEventListener("click", function () {
            fileContainer.style.display = "block";  // Show file container
            folderSection.style.display = "none";   // Hide folder section
            toggleCreateFolderButton();             // Update button visibility
        });
    });

    // Back button logic to restore folder section
    logoImg.addEventListener("click", function () {
        fileContainer.style.display = "none";  // Hide file container
        folderSection.style.display = "block"; // Show folder section
        toggleCreateFolderButton();            // Show button again
    });

    // Initial check
    toggleCreateFolderButton();
});

document.addEventListener("DOMContentLoaded", function () {
    const notificationBtn = document.querySelector(".notification-btn");
    const folderSection = document.querySelector(".folder-section");

    function checkVisibility() {
        const computedStyle = getComputedStyle(folderSection);
        const isFolderVisible = computedStyle.display === "block" || computedStyle.display === "flex";
        const isFolderNotEmpty = folderSection.children.length > 0;

        if (isFolderVisible && isFolderNotEmpty) {
            notificationBtn.style.display = "block"; // Show button
        } else {
            notificationBtn.style.display = "none"; // Hide button
        }
    }

    // MutationObserver to detect changes inside folder-section
    const observer = new MutationObserver(checkVisibility);
    observer.observe(folderSection, { childList: true, attributes: true });

    // Also listen for display property changes
    const displayObserver = new MutationObserver(checkVisibility);
    displayObserver.observe(folderSection, { attributes: true, attributeFilter: ["style"] });

    // **Force a check after DOM is fully loaded**
    setTimeout(checkVisibility, 100);
});



// Show logout popup
document.getElementById('logoutBtn').addEventListener('click', function () {
    document.getElementById('logoutPopup').style.display = 'flex';  // Show popup
});

// Close logout popup
function closeLogoutPopup() {
    document.getElementById('logoutPopup').style.display = 'none';  // Close popup
}


// Logout action
async function logout() {

    const token = localStorage.getItem('access_token');
    // alert('You have been logged out.');
    try {
        const response = await fetch('https://enigmakey.tech/serv/logout-post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        const result = await response.json();

        if (result.message !== '') {
            localStorage.removeItem("access_token"); // Token ko localStorage se remove karega
            localStorage.removeItem("currentUser"); // Token ko localStorage se remove karega
            localStorage.removeItem("userId"); // Token ko localStorage se remove karega
            localStorage.removeItem("selectedUser"); // Token ko localStorage se remove karega 
            window.location.href = "/signin";
        }

    } catch (error) {
        console.error("🚀 ~ logout ~ error:", error)
    };

}


// Zoom Disable (Ctrl + Scroll)
// document.addEventListener("wheel", function (event) {
//     if (event.ctrlKey) {
//         event.preventDefault();
//     }
// }, { passive: false });

// // Right-Click Disable
// document.addEventListener("contextmenu", function (event) {
//     event.preventDefault();
// });

// // Keyboard Shortcuts Disable
// document.addEventListener("keydown", function (event) {
//     // Ctrl + Any Key Disable
//     if (event.ctrlKey || event.metaKey) {
//         event.preventDefault();
//     }

//     // Specific Keys Disable
//     const disabledKeys = ["F12", "F11", "F10", "F9", "F8", "F7", "F6", "F5", "F4", "F3", "F2", "F1"];
//     if (disabledKeys.includes(event.key)) {
//         event.preventDefault();
//     }
// });

// // // Disable Back Button
// history.pushState(null, "", location.href);
// window.onpopstate = function () {
//     history.pushState(null, "", location.href);
// };

// // // Disable F5, Ctrl+R
// document.addEventListener("keydown", function (event) {
//     if (event.key === "F5" || (event.ctrlKey && event.key === "r")) {
//         event.preventDefault();
//     }
// });

// // Show Warning on Reload
// window.addEventListener("beforeunload", function (event) {
//     event.preventDefault();
//     event.returnValue = ""; 
// });



// Show popup
document.getElementById('createFolderBtn').addEventListener('click', function () {
    const popup = document.getElementById('createFolderPopup');
    popup.style.visibility = 'visible';  // Make the popup visible
    popup.style.opacity = '1';  // Fade it in
});

// Close popup
function closePopup() {
    const popup = document.getElementById('createFolderPopup');
    popup.style.visibility = 'hidden';  // Hide the popup
    popup.style.opacity = '0';  // Fade it out
}

// // Create folder logic
// function createFolder() {
//     const folderName = document.getElementById('folderName').value;
//     if (folderName) {
//         alert('Folder "' + folderName + '" created!');
//         closePopup();
//     } else {
//         alert('Please enter a folder name.');
//     }
// }

function createFolder() {
    const folderName = document.getElementById('folderName').value;

    if (!folderName) {
        showCustomAlert('Please enter a folder name.');
        return;
    }

    fetch('/create-folder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ folder_name: folderName })
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                showCustomAlert(data.message);
                closePopup(); // assuming this hides the popup UI
                location.reload();
                // optionally refresh folder list here
            } else if (data.error) {
                showCustomAlert("Error: " + data.error);
            }
        })
        .catch(error => {
            console.error("Error:", error);
            showCustomAlert("An error occurred while creating the folder.");
        });
}


function showCustomAlert(message) {
    document.getElementById('custom-alert-message').textContent = message;
    document.getElementById('custom-alert').style.display = 'flex';
  }
  
  function hideCustomAlert() {
    document.getElementById('custom-alert').style.display = 'none';
  }
  
// function uploadFile() {
//     const fileInput = document.getElementById('fileUpload');
//     const file = fileInput.files[0]; // Get the first selected file

//     if (file) {
//         // Hide the file input button after a file is selected
//         fileInput.style.display = 'none';

//         // Display the file name in the console
//         console.log(`Selected file: ${file.name}`);

//         // Optional: You can also show the file name in a paragraph element
//         const fileNameElement = document.getElementById('fileName');
//         if (fileNameElement) {
//             fileNameElement.textContent = `Selected file: ${file.name}`;
//         }
//     } else {
//         console.error('No file selected!');
//     }
// }
document.addEventListener('DOMContentLoaded', function () {
    document.body.style.userSelect = 'none';

    // Also disable mouse-based selection
    document.body.addEventListener('selectstart', function (e) {
        e.preventDefault();
    });
});
