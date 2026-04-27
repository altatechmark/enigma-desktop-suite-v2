var allUsers = [];
let archivedUsers = [];
let archivedOnly = []; // Global variable to store filtered archived users


// Global variable to prevent showing multiple toasts at once
let isToastActive = false;

// Function to show toast only once, based on the flag
function showToastOnceOnly(message) {
    if (isToastActive) return;  // Skip if a toast is already active
    isToastActive = true;

    // Show the toast
    Toastify({
        text: message,
        duration: 3000,  // Duration of the toast (in milliseconds)
        gravity: "top",  // Position from top or bottom
        position: "center", // Position: left, right, center
        backgroundColor: "green", // Toast background color
        callback: function () {
            isToastActive = false; // Reset flag when the toast is finished
        },
    }).showToast();
}
//end Function to show toast 

const API_BASE_URL = "https://enigmakey.tech/serv";

// ✅ Function to fetch access token
const getToken = () => localStorage.getItem("access_token");

// ✅ Function to fetch all users
const getAllUsers = async () => {
    const token = getToken();
    if (!token) {
        console.error("❌ Token not found");
        return [];
    }

    try {
        const response = await fetch(`${API_BASE_URL}/get-all-users`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (!data?.users || !Array.isArray(data.users)) {
            console.error("❌ Invalid API response for users");
            return [];
        }

        allUsers = data.users; // ✅ Store all users
        return allUsers;
    } catch (error) {
        console.error("🚀 getAllUsers error:", error);
        return [];
    }
};

// ✅ Function to fetch archived users
const getArchivedUsers = async () => {
    const token = getToken();
    if (!token) {
        console.error("❌ Token not found");
        return [];
    }

    try {
        const response = await fetch(`${API_BASE_URL}/get-archive`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json();

        if (!data?.archive || !Array.isArray(data.archive)) {
            console.error("❌ Invalid API response for archive");
            return [];
        }

        archivedUsers = data.archive; // ✅ Store archived users
        console.log("archived users", archivedUsers)
        return archivedUsers;
    } catch (error) {
        console.error("🚀 Error fetching archived users:", error);
        return [];
    }
};

// ✅ Function to remove user from archive
const RemoveFromArchived = async (user_id) => {
    const token = getToken();
    if (!token) {
        console.error("❌ Token not found");
        return;
    }

    if (!user_id) {
        console.error("❌ Invalid User ID:", user_id);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/remove-archive-user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ user_id })
        });

        const data = await response.json();

        if (data.message) {
            console.log(`✅ User removed: ${data.message}`);
            showToastOnceOnly("Successfully remove from archieved!");

            // ✅ Archive list se user hatao
            archivedUsers = archivedUsers.filter(user => user.id !== user_id);

            // ✅ List ko dubara render karo
            // loadAndRenderUsers(); 

            setTimeout(async () => {
                await loadAndRenderArchivedUsers(); // 🔄 Refresh the starred users list
            }, 2000);


        }
    } catch (error) {
        console.error("🚀 Error removing from archive:", error);
    }
};

// ✅ Function to render messages for all users (archived + non-archived)
const messagesList = document.getElementById("messagesList");

const renderMessages = (users) => {
    if (!messagesList) {
        console.error("❌ messagesList element not found!");
        return;
    }

    messagesList.innerHTML = ""; // ✅ Clear previous users

    users.forEach((user) => {
        console.log("🔍 Checking user data:", user); // ✅ Debugging

        const userId = user.id;
        const userName = user.username || "Unknown User";
        const userImage = user.profile_image
            ? `https://enigmakey.tech/serv/files/${user.profile_image}`
            : '../static/chatimg/user-profile.png';
        console.log("📷 Profile Image URL:", userImage);
        const lastMessage = user.archive?.length ? user.archive[user.archive.length - 1] : "No messages";

        if (!userId) {
            console.error("❌ Skipping user with missing ID:", user);
            return;
        }

        const isArchived = archivedUsers.some(archivedUser => archivedUser === userId);

        console.log("📝 Archived Users List:", archivedUsers);
        console.log("🔍 Checking user ID:", userId);
        console.log("✅ isArchived value:", isArchived);


        const listItem = document.createElement("li");
        listItem.classList.add("message-item");

        listItem.innerHTML = `
            <a href="#" data-id="${userId}">
                <div class="image-wrapper">
                    <img src="${userImage}" alt="myimage" class="sender-image">
                </div>
                <div class="content-message-info">
                    <span>${userName}</span>
                   <!-- <span>${lastMessage}</span> -->
                </div>
                <div class="image-container">
                   <!-- <img class="message-image" src="../static/images/lock.png" alt="Image"> -->
                </div>
                ${isArchived ? `<button class="unarchive-btn" data-userid="${userId}"><img src="../static/images/aaaa.png" alt="" width = 23px></button>` : ""}
                
            </a>
        `;
        console.log(isArchived);


        messagesList.appendChild(listItem);
    });

    // ✅ Attach event listeners to "Unarchive" buttons
    document.querySelectorAll(".unarchive-btn").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            const userId = button.getAttribute("data-userid");

            if (!userId) {
                console.error("❌ User ID is undefined for RemoveFromArchived");
                return;
            }

            RemoveFromArchived(userId);
            setTimeout(() => {
                location.reload();
            }, 2000); // 2000 milliseconds = 2 seconds
        });
    });
};

// ✅ Function to load and render all users (archived + non-archived)
const loadAndRenderArchivedUsers = async () => {
    const users = await getAllUsers();
    const archived = await getArchivedUsers();

    if (!users.length || !archived.length) {
        // console.warn("⚠️ No archived users found.");
        messagesList.innerHTML = '<li class="no-results">No archived messages found</li>';
        return;
    }

    // ✅ Store filtered archived users in global variable
    archivedOnly = users.filter(user =>
        archived.some(archivedUser => archivedUser === user.id)
    );

    renderMessages(archivedOnly); // ✅ Render only archived users
};


// ✅ Load archived users on page load
loadAndRenderArchivedUsers();
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();

    if (!query) {
        renderMessages(archivedOnly); // ✅ Show only archived users when search is empty
        return;
    }

    // ✅ Search only inside archived users
    const filteredUsers = archivedOnly.filter(user =>
        user.username && user.username.toLowerCase().includes(query)
    );

    if (filteredUsers.length === 0) {
        messagesList.innerHTML = `
            <img src="../static/images/datanotfound.png" alt="No Data Found" class="no-results-image" />
            <li class="no-results">No results found</li>`;
    } else {
        renderMessages(filteredUsers);
    }
});



// Zoom Disable (Ctrl + Scroll)
// document.addEventListener("wheel", function(event) {
//     if (event.ctrlKey) {
//         event.preventDefault();
//     }
// }, { passive: false });

// // Right-Click Disable
// document.addEventListener("contextmenu", function(event) {
//     event.preventDefault();
// });

// // Keyboard Shortcuts Disable
// document.addEventListener("keydown", function(event) {
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

document.addEventListener("wheel", function (event) {
    if (event.ctrlKey) {
        event.preventDefault();
    }
}, { passive: false });

// Right-Click Disable
document.addEventListener("contextmenu", function (event) {
    event.preventDefault();
});

// Keyboard Shortcuts Disable
document.addEventListener("keydown", function (event) {
    // Ctrl + Any Key Disable
    if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
    }

    // Specific Keys Disable
    const disabledKeys = ["F12", "F11", "F10", "F9", "F8", "F7", "F6", "F5", "F4", "F3", "F2", "F1"];
    if (disabledKeys.includes(event.key)) {
        event.preventDefault();
    }
});

// // Disable F5, Ctrl+R
document.addEventListener("keydown", function (event) {
    if (event.key === "F5" || (event.ctrlKey && event.key === "r")) {
        event.preventDefault();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    document.body.style.userSelect = 'none';

    // Also disable mouse-based selection
    document.body.addEventListener('selectstart', function (e) {
        e.preventDefault();
    });
});
