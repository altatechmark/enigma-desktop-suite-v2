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

document.addEventListener("DOMContentLoaded", function () {
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





// Array of 10 random users with dummy data
const users = [
    { id: 1, username: 'John Doe', image: '../static/images/david.jpg' },
    { id: 2, username: 'Jane Smith', image: '../static/images/elza.jpg' },
    { id: 3, username: 'Alice Johnson', image: '../static/images/em.jpg' },
    { id: 4, username: 'Bob Brown', image: '../static/images/hammad.jpg' },
    { id: 5, username: 'Charlie Davis', image: '../static/images/mi.jpg' },
    { id: 6, username: 'Eve Miller', image: '../static/images/miic.jpg' },
    { id: 7, username: 'David Wilson', image: '../static/images/patri.jpg' },
    { id: 8, username: 'Emily Moore', image: '../static/images/pf.jpeg' },
    { id: 9, username: 'Frank Taylor', image: '../static/images/rich.jpg' },
    { id: 10, username: 'Grace Lee', image: '../static/images/talking.png' },
    { id: 11, username: 'Frank Taylor', image: '../static/images/rich.jpg' },
    { id: 12, username: 'Frank Taylor', image: '../static/images/rich.jpg' },
    { id: 13, username: 'Frank Taylor', image: '../static/images/rich.jpg' },
    { id: 14, username: 'Frank Taylor', image: '../static/images/rich.jpg' },
    { id: 15, username: 'Frank Taylor', image: '../static/images/rich.jpg' },
    { id: 16, username: 'Frank Taylor', image: '../static/images/rich.jpg' },
    { id: 17, username: 'Frank Taylor', image: '../static/images/rich.jpg' },
    { id: 18, username: 'Frank Taylor', image: '../static/images/rich.jpg' },
    { id: 19, username: 'Frank Taylor', image: '../static/images/rich.jpg' },
    { id: 20, username: 'Frank Taylor', image: '../static/images/rich.jpg' },
];

// Function to generate user elements and display them
function generateUserList() {
    const userListContainer = document.getElementById('userList');
    users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.classList.add('row', 'align-items-center', 'user-item');
        userDiv.dataset.userId = user.id;

        userDiv.innerHTML = `
            <div class="col-auto">
                <img src="${user.image}" alt="Image" class="img-fluid">
            </div>
            <div class="col">
                <p class="user-name">${user.username}</p>
            </div>
            <div class="col-auto">
                <button class="btn send-btn" onclick="sendAlert('${user.username}')">Send</button>
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
    alert(`You clicked on ${username}`);
}

// Call the function to generate the user list when the modal is shown
document.getElementById('myModal').addEventListener('shown.bs.modal', generateUserList);




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
                    <img src="../static/images/file.png" alt="Separator Image" style="width: 100%; height: 10px; object-fit: cover; margin: 20px 0;" />
                </div>
                <div class="folder-time">${file.dateTime}</div>
            </div>
            <div class="kebab-menu">
                <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#myModal">⋮</button>
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
// class="kebab-menu-btn" 
// Function to open the modal and toggle visibility
document.querySelectorAll('.kebab-menu-btn').forEach((button) => {
    button.addEventListener('click', function () {
        const index = this.getAttribute('data-index');
        const file = files[index];

        // Modal body ko dynamically update karein
        modalBody.innerHTML = `
            <p class="text">Send To</p>
            <div class="container mt-5">
                <div class="popup-option">
                    <img src="icon1.png" alt="icon1">
                    <span>${file.fileName}</span>
                </div>
                <!-- Other options -->
            </div>
        `;

        // Modal show karein
        myModal.show();
    });
});
// Close modal when clicking outside the modal
// document.addEventListener('click', (e) => {
//     const modals = document.querySelectorAll('.modal');
//     modals.forEach(modal => {
//         if (!modal.contains(e.target) && !modal.previousElementSibling.contains(e.target)) {
//             modal.style.display = 'none';
//         }
//     });
// });