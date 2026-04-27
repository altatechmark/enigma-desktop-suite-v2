
const API_BASE_URL = "https://enigmakey.tech/serv";
const messagesList = document.getElementById("messagesList");

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

// ✅ Function to fetch access token
const getToken = () => localStorage.getItem("access_token");

async function removeFromStar(userId) {
    try {
        const token = getToken(); // 🔄 Changed from getSessionToken() to getToken()
        if (!token) {
            showCustomAlert("Authorization token is missing. Please log in again.");
            return;
        }

        const response = await fetch(`${API_BASE_URL}/remove-star-user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ user_id: userId }),
        });

        const data = await response.json();
        if (response.ok) {
            console.log("✅ User removed from star!");
             // Show toast only once
             showToastOnceOnly("Successfully UnStar!");
            setTimeout(async () => {
                await renderStarredMessages(); // 🔄 Refresh the starred users list
            }, 2000);
        } else {
            showCustomAlert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error("🚀 Error removing user from star:", error);
    }
}

async function removeFromStarAndRenderStared(userId) {
    try {
        const token = getToken(); // 🔄 Changed from getSessionToken() to getToken()
        if (!token) {
            showCustomAlert("Authorization token is missing. Please log in again.");
            return;
        }

        const response = await fetch(`${API_BASE_URL}/remove-star-user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ user_id: userId }),
        });

        const data = await response.json();
        if (response.ok) {
            console.log("✅ User removed from star!");
             // Show toast only once
             showToastOnceOnly("Successfully UnStar!");
            setTimeout(async () => {
                await renderStarredMessages(); // 🔄 Refresh the starred users list
            }, 2000);
        } else {
            showCustomAlert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error("🚀 Error removing user from star:", error);
    }
}



// ✅ Function to fetch starred users' IDs
async function fetchStarredUsers() {
    try {
        const token = getToken();
        if (!token) {
            console.error("❌ Authorization token missing");
            return [];
        }

        const response = await fetch(`${API_BASE_URL}/get-star`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.error("❌ Failed to fetch starred users. Status:", response.status);
            return [];
        }

        const data = await response.json();
        return data.star || [];
    } catch (error) {
        console.error("🚀 Error fetching starred users:", error);
        return [];
    }
}

// ✅ Function to fetch user details (Updated: Using GET request)
async function fetchUserDetails() {
    try {
        const token = getToken();
        if (!token) {
            console.error("❌ Authorization token missing");
            return [];
        }

        const response = await fetch(`${API_BASE_URL}/get-all-users`, {
            method: "GET", // ✅ Changed from POST to GET
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.error("❌ Failed to fetch user details. Status:", response.status);
            return [];
        }

        const data = await response.json();
        return data.users || [];
    } catch (error) {
        console.error("🚀 Error fetching user details:", error);
        return [];
    }
}

// ✅ Function to render starred messages
let globalStarredUsers = []; // Store starred users globally for search

async function renderStarredMessages(query = "") {
    messagesList.innerHTML = "<p style='padding-left:14px;'>Loading...</p>";

    const starredUserIds = await fetchStarredUsers();
    const allUsers = await fetchUserDetails();

    messagesList.innerHTML = "";

    if (!starredUserIds.length || !allUsers.length) {
        messagesList.innerHTML = '<li class="no-results">No starred messages found</li>';
        return;
    }

    // ✅ Filter only starred users
    let starredUsers = allUsers.filter(user => starredUserIds.includes(user.id));
    globalStarredUsers = starredUsers; // Store for search

    // ✅ Apply search filter if query exists
    if (query) {
        query = query.toLowerCase().trim();
        starredUsers = starredUsers.filter(user => 
            user.username && user.username.toLowerCase().includes(query)
        );
    }

    if (starredUsers.length === 0) {
        messagesList.innerHTML = `
            <img src="../static/images/datanotfound.png" alt="No Data Found" class="no-results-image" />
            <li class="no-results">No results found</li>
        `;
        return;
    }

    starredUsers.forEach((user) => {
        const userImage = user.profile_image
            ? `${API_BASE_URL}/files/${user.profile_image}`
            : "../static/chatimg/user-profile.png";
        const lastMessage = user.send?.[0] || "No messages";

        const listItem = document.createElement("li");
        listItem.classList.add("message-item");
        listItem.innerHTML = `
            <a href="#" data-id="${user.id}">
                <div class="image-wrapper">
                    <img src="${userImage}" alt="Profile Image" class="sender-image">
                </div>
                <div class="content-message-info">
                    <span>${user.username || "Unknown User"}</span>
                   <!-- <span>${lastMessage}</span> -->
                </div>
                <div class="button-container">
                    <button class="unstar-btn" data-userid="${user.id}"><img src="../static/chatimg/star.png" alt=""></button>
                </div>
            </a>
        `;
        messagesList.appendChild(listItem);
    });

    // ✅ Attach event listeners to "Unstar" buttons
    document.querySelectorAll(".unstar-btn").forEach((button) => {
        button.addEventListener("click", async (event) => {
            event.stopPropagation();
            const userId = button.getAttribute("data-userid");

            if (!userId) {
                console.error("❌ User ID is undefined for removeFromStar");
                return;
            }

            await removeFromStarAndRenderStared(userId);
        });
    });
}

// ✅ Attach event listener for search input
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();
    renderStarredMessages(query); // ✅ Pass search query
});

// ✅ Load starred messages on page load
renderStarredMessages();

function showCustomAlert(message) {
    document.getElementById('custom-alert-message').textContent = message;
    document.getElementById('custom-alert').style.display = 'flex';
  }
  
  function hideCustomAlert() {
    document.getElementById('custom-alert').style.display = 'none';
  }
  
// Zoom Disable (Ctrl + Scroll)
document.addEventListener("wheel", function(event) {
    if (event.ctrlKey) {
        event.preventDefault();
    }
}, { passive: false });

// Right-Click Disable
document.addEventListener("contextmenu", function(event) {
    event.preventDefault();
});

// Keyboard Shortcuts Disable
document.addEventListener("keydown", function(event) {
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

document.addEventListener('DOMContentLoaded', function () {
    document.body.style.userSelect = 'none';

    // Also disable mouse-based selection
    document.body.addEventListener('selectstart', function (e) {
        e.preventDefault();
    });
});
