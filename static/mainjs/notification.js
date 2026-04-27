document.addEventListener("click", function (event) {
    // Check if the clicked element is inside .message-item
    const messageItem = event.target.closest(".message-item");
    if (!messageItem) return; // Ignore clicks outside .message-item

    event.preventDefault(); // Prevent default action
    

    // Remove 'active' class from all message items
    document.querySelectorAll(".message-item").forEach(item => item.classList.remove("active"));

    // Add 'active' class to the clicked message item
    messageItem.classList.add("active");
});




var serverMessages = [];
var allUsers = [];
var userId = '';

function getSelectedUser() {
    const user = localStorage.getItem('selectedUser');
    return user ? JSON.parse(user) : null;
}

const selectedUser = getSelectedUser();


document.addEventListener("DOMContentLoaded", async () => {
    await getSessionData(); // ✅ Pehle session data load hoga
    getCallHistory(); // ✅ Call Logs API call hogi
    getChatHistory(); // ✅ Chat Logs API call hogi
    getAllUsers(); // ✅ All users fetch karna zaroori hai
});



// 🟢 `currentUser` define karein
const currentUser = getSelectedUser();

if (!currentUser || !currentUser.username) {
    console.error("❌ currentUser is undefined");
} else {
    console.log("✅ Current User:", currentUser);
}

// ✅ Messages ko click karne par `user` define karein
// ✅ Cookie Set Karne ka Function
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; expires=${expires.toUTCString()}; path=/`;
    console.log("Cookie Set:", document.cookie);  // Log cookies to see if it's set
}


document.addEventListener("click", async (event) => {

    const messageItem = event.target.closest(".message-item");
    console.log("🚀 ~ document.addEventListener ~ messageItem:", messageItem)
    if (!messageItem) return;

    event.preventDefault();

    const username = messageItem.querySelector("a").getAttribute("data-username");
    const notificationId = messageItem.querySelector("a").getAttribute("data-notification-id");
    const encodedNotification = messageItem.querySelector("a").getAttribute("data-notification");

    // ✅ Decode and parse it in one step, reassign to original variable name
    const notificationData = JSON.parse(decodeURIComponent(encodedNotification));
    
    console.log("🚀 ~ Parsed notificationData:", notificationData);
    console.log("🚀 ~ Call type:", notificationData.call_type);
    
    // ✅ Keep using notificationData instead of jsonNotificationData
    

    if (!username || !notificationId) {
        console.error("❌ No username or notificationId found in clicked item.");
        return;
    }

    console.log("🔍 Clicked Username:", username);
    console.log("🔔 Notification ID:", notificationId);

    const call = callHistory.find(c => c.notification_id === notificationId);

    const user = {
        caller: { username: username },
        receiver: { username: localStorage.getItem("userName") }
    };
    
    const filteredUser = await filterCurrentUser(user);
    
    if (!filteredUser) return;
    
    console.log("✅ Filtered User:", filteredUser);
    
    // ✅ **Agar pehle se read hai to API skip karo, magar navigate aur cookie store karo**
    if (call?.read_status) {
        console.log("⚠️ Call already read, skipping API call.");
        
        // ✅ **User Object ko Cookies Mein Store Karo**
        setCookie("selectedUser", filteredUser, 1);
    
        setTimeout(() => {
            window.location.href = "chat"; // Navigate after delay
        }, 3000);
        return;
    }
    
    // ✅ **Agar unread hai to API call karo**

    if (notificationData.message_type === 'text') {
        await updateChatReadStatus(notificationId);
    } else if (
        notificationData.call_type === 'video' ||
        notificationData.call_type === 'audio'
    ) {
        console.log("✅ Updating call read status:", notificationData.call_type);
        await updateCallReadStatus(notificationId);
    }
    
    // ✅ **User Object ko Cookies Mein Store Karo**
    setCookie("selectedUser", filteredUser, 1);
    
    setTimeout(() => {
        window.location.href = "chat"; // Navigate after delay
    }, 3000);
    
});




// ✅ `filterCurrentUser` function ko properly call karein
const filterCurrentUser = async (user) => {
    const allUsers = await getAllUsers(); // ✅ Ensure users are loaded

    // 🔥 Sirf clicked user (caller) ko filter karo
    const filteredUser = allUsers.find(filteredUser =>
        filteredUser?.username === user?.caller?.username
    );

    // console.log("✅ Filtered User:", filteredUser);
    return filteredUser; // Sirf ek user return hoga ya null
};





const getMessages = async () => {
    renderMessages();
    try {
        const response = await fetch(`${API_BASE_URL}/get_messages?name1=${currentUser.username}&name2=${selectedUser.username}&page=${1}&page_size=${currentPage}`);
        // const response = await fetch(`${API_BASE_URL}/get_messages?name1=${currentUser?.username}&name2=${selectedUser?.username}&page=1&page_size=20`);
        //http://enigmakey.tech/serv/get_messages?name1=Ahsan&name2=Farooq&page=3&page_size=5

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("getmessages", data);
        serverMessages = data.messages;


        console.log("🚀 ~ getMessages ~ serverMessages:", serverMessages)

        serverMessages.push(...data.messages);


    } catch (error) {
        console.error("🚀 ~ getMessages ~ error:", error);
    }
};

// const API_BASE_URL = 'https://enigmakey.tech/serv';



const getAllUsers = async () => {
    const token = localStorage.getItem('access_token');
    try {
        const response = await fetch(`https://enigmakey.tech/serv/get-all-users`, {
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
        console.log("users", data);

        // ✅ `allUsers` array ko update kar diya
        allUsers = data.users || [];

        return allUsers; // ✅ Filtered users return ho rahe hain
    } catch (error) {
        console.error('getAllUsers error', error);
    }
};


// getAllUsers();





// 🟢 Step 1: Pehle session data fetch karna
async function getSessionData() {
    try {
        const response = await fetch('/session-data');
        const data = await response.json();

        console.log("📥 Session API Response:", data);

        if (data.success && data.user_data) {
            localStorage.setItem('userName', data.user_data.username);
            localStorage.setItem('userId', data.user_data.user_id); // ✅ Store user_id
            localStorage.setItem('access_token', data.user_data.access_token);
            return data.user_data;
        }
    } catch (error) {
        console.error("❌ Session Data API Error:", error);
    }
    return null;
}


// 🟢 Default Values
let limit = 10; // ✅ Default limit set kiya
let callHistory = [];
let chatHistory = [];
page = 1;

// ✅ Call History Set Function
const setCallHistory = (data) => {
    console.log("🚀 ~ setCallHistory ~ data:", data)
    callHistory = [...callHistory, ...data]; // ✅ Purane + naye records
    console.log("🚀 ~ setCallHistory ~ callHistory:", callHistory)
    updateMergedHistory();
};

const setChatHistory = (data) => {
    console.log("🚀 ~ setChatHistory ~ data:", data)
    if (!Array.isArray(data)) return;
    chatHistory = [...chatHistory, ...data]; // ✅ Purane + naye records
    console.log("🚀 ~ setChatHistory ~ chatHistory:", chatHistory)
    updateMergedHistory();
};


// 🟢 Step 2: Call Logs API
const getCallHistory = async () => {
    const token = localStorage.getItem('access_token');
    const userName = localStorage.getItem('userName');

    if (!userName || !token) {
        console.error("❌ Missing token or username");
        return;
    }

    try {
        const response = await fetch(
            `http://enigmakey.tech/serv/get_call_logs?username=${userName}&page=${page}&limit=${limit}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        const data = await response.json();
        console.log("calls data checking", data)
        setCallHistory(data);

        //    // ✅ Har call ka read status update karein
        //    data.forEach((call) => {
        //     if (call.notification_id) {
        //         updateCallReadStatus(call.notification_id);
        //     } else {
        //         console.warn("⚠️ notification_id missing for a call:", call);
        //     }
        // });

    } catch (error) {
        console.error("❌ getCallHistory API Error:", error);
    }
};

// 🟢 Step 3: Chat Logs API
const getChatHistory = async () => {
    const token = localStorage.getItem('access_token');
    const userName = localStorage.getItem('userName');

    if (!userName || !token) {
        console.error("❌ Missing token or username");
        return;
    }

    try {
        const response = await fetch(
            `https://enigmakey.tech/serv/get-chat-logs?username=${userName}&page=${page}&limit=${limit}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`❌ Server error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log("📥 Chat History API Response:", data);

        setChatHistory(data); // ✅ Proper array pass kiya

        if (!data || !data.success || !Array.isArray(data)) {
            console.error("❌ Invalid response format, expected array:", data);
            return;
        }


    } catch (error) {
        console.error("❌ getChatHistory API Error:", error);
    }
};


// 🟢 Step 4: Merged History Update Function
const updateMergedHistory = () => {
    const mergedHistory = [...callHistory, ...chatHistory].sort((a, b) => {
        const timeA = new Date(a.timestamp || a.call_time).getTime();
        const timeB = new Date(b.timestamp || b.call_time).getTime();
        return timeB - timeA; // ✅ Latest notification sab se pehle
    });
    
    console.log("🚀 ~ mergedHistory ~ mergedHistory:", mergedHistory)

     // ✅ De-duplicate based on notification_id (or another unique key)
     const uniqueMap = new Map();
     mergedHistory.forEach(item => {
         const id = item.notification_id || item.timestamp || item.call_time;
         if (!uniqueMap.has(id)) {
             uniqueMap.set(id, item);
         }
     });
 
     const uniqueHistory = Array.from(uniqueMap.values());

     
    const userName = localStorage.getItem('userName');

    const filteredNotifications = uniqueHistory.filter(item =>
        (item.receiver?.username === userName && item.message_type === "text") ||
        (item.receiver?.username === userName && item.call_type === "video") ||
        (item.receiver?.username === userName && item.call_type === "audio")
    );
    console.log("🚀 ~ updateMergedHistory ~ filteredNotifications:", filteredNotifications)

    renderMessages(filteredNotifications);
};


// 🟢 Step 5: Page Load pe sab kuch initialize karna
document.addEventListener("DOMContentLoaded", async () => {
    await getSessionData(); // ✅ Pehle session data load hoga
    getCallHistory(); // ✅ Call Logs API call hogi
    getChatHistory(); // ✅ Chat Logs API call hogi
    // removeCountFromStorage(); 
    // RemoveNotificationcount();
});



async function updateChatReadStatus(notificationId) {
    console.log("notify", notificationId)
    const token = localStorage.getItem('access_token'); // Token ko localStorage se lo

    try {
        if (notificationId && token) {
            const response = await fetch(
                `https://enigmakey.tech/serv/update-chat-history/${notificationId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ read_status: true }) // Request body
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            console.log("✅ Chat read status updated successfully", response.data);

              // ✅ 2 second tak screen per dikhaye, phir redirect kare
              setTimeout(() => {
                window.location.href = "chat";
            }, 1000); // 2 seconds delay



        } else {
            showCustomAlert("Something is missing");
        }
    } catch (error) {
        console.error("🚀 ~ updateCallReadStatus ~ error:", error);
    }
}

async function updateCallReadStatus(notificationId) {
    console.log("notify", notificationId)
    const token = localStorage.getItem('access_token'); // Token ko localStorage se lo

    try {
        if (notificationId && token) {
            const response = await fetch(
                `https://enigmakey.tech/serv/update-call-history/${notificationId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ read_status: true }) // Request body
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            console.log("✅ Call read status updated successfully");

              // ✅ 2 second tak screen per dikhaye, phir redirect kare
              setTimeout(() => {
                window.location.href = "chat";
            }, 1000); // 2 seconds delay



        } else {
            showCustomAlert("Something is missing");
        }
    } catch (error) {
        console.error("🚀 ~ updateCallReadStatus ~ error:", error);
    }
}

function getRelativeTime(callTimeString) {
    const callDate = new Date(callTimeString);
    const now = new Date();

    // Normalize time to compare only dates
    const callDay = new Date(callDate.getFullYear(), callDate.getMonth(), callDate.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffTime = today - callDay;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return callDate.toLocaleDateString("en-US", { weekday: 'long' });
    if (diffDays < 30) return `${diffDays} days ago`;

    return callDate.toLocaleDateString(); // fallback: full date
}


// 🟢 Step 6: Messages Render Function
const messagesList = document.getElementById("messagesList");


const renderMessages = (users) => {
    // console.log("🚀 ~ renderMessages ~ users:", users)
    if (!messagesList) {
        console.error("❌ messagesList element not found!");
        return;
    }

    messagesList.innerHTML = ""; // ✅ Pehli list clear karna

    const loadMoreButton = document.createElement("button");
    loadMoreButton.textContent = "Load More";
    loadMoreButton.classList.add("new-message-btn");

    loadMoreButton.onclick = async () => {
        page++; // ✅ Page number increment karo
        await getCallHistory(); // ✅ Naye call logs fetch karo
        await getChatHistory(); // ✅ Naye chat logs fetch karo
    };

    messagesList.appendChild(loadMoreButton); // ✅ Button messages list me add karo


    users.forEach((user) => {
        console.log("🚀 ~ users.forEach ~ user:", user)
        let callImage = "";
      
        if (user.call_type === "video") {
            callImage = `<img src="../static/chatimg/Video call.png" alt="Video Call" class="call-icon" style="cursor: pointer;">`;
        } else if (user.call_type === "audio") {
            callImage = `<img src="../static/chatimg/calls.png" alt="Audio Call" class="call-icon" style="cursor: pointer;">`;
        }

        // ✅ Call Status Image (Missed ya Received)
        let callstatusmage = "";
        if (user.call_status === "missedcall") {
            callstatusmage = `<img src="../static/chatimg/missedcall.jpg" alt="Missed Call" class="call-icon" style="cursor: pointer;">`;
        } 

        if (user.call_status !== "missedcall" && user.message_type !== 'text') {
            callstatusmage = `<img src="../static/images/recieved-call.png" alt="Received Call" class="call-icon" style="cursor: pointer;">`;
        }

        // ✅ Caller aur call ki details lene ke liye variables define karein
        const username = user?.caller?.username || user?.sender?.username;
        const notificationId = user.notification_id;
        const callTimeLabel = getRelativeTime(user.call_time);
        const image = user?.call_type 
  ? `https://enigmakey.tech/serv/files/${user.caller?.profile_image}` 
  : `https://enigmakey.tech/serv/files/${user.sender?.profile_image}`;



        // ✅ **Read status check**
        const isRead = user.read_status; // API response se read_status check karein
        const listItem = document.createElement("li");
        listItem.classList.add("message-item");

        if (!isRead) {
            listItem.classList.add("active"); // ✅ Agar read nahi hai toh dark color
        }

        listItem.innerHTML = `
            <a href="#" 
               data-username="${username}" 
               data-notification-id="${notificationId}"
               data-notification="${encodeURIComponent(JSON.stringify(user))}"
               >
                <div class="image-wrapper">
                    <img src=${image} class="sender-image">
                </div>
                <div class="content-message-info">
                    <div class="message-header">
                        <span class="username">${username}</span>
                        <div class="message-icons">
                        ${callstatusmage} ${callImage} 
                        </div>
                    </div>
                    <span class="message-text">${user.message || ""}</span>
                    
                    ${user?.call_type === 'audio' || user?.call_type === 'video' ?` <span class="message-time">${callTimeLabel}</span>` : ''}

                </div>
            </a>

       
        `;

        messagesList.appendChild(listItem);
    });
};


function showCustomAlert(message) {
    document.getElementById('custom-alert-message').textContent = message;
    document.getElementById('custom-alert').style.display = 'flex';
  }
  
  function hideCustomAlert() {
    document.getElementById('custom-alert').style.display = 'none';
  }




// document.addEventListener("click", (event) => {
//     const link = event.target.closest("a[data-username]");

//     if (link) {
//         const username = link.getAttribute("data-username");
//         const notificationId = link.getAttribute("data-notification-id");

//         console.log("Caller Username:", username);
//         console.log("Notification ID:", notificationId);
//     }
// });




// ✅ Zoom Disable (Ctrl + Scroll)
// document.addEventListener("wheel", function(event) {
//     if (event.ctrlKey) {
//         event.preventDefault();
//     }
// }, { passive: false });

// // ✅ Right-Click Disable
// document.addEventListener("contextmenu", function(event) {
//     event.preventDefault();
// });

// // ✅ Keyboard Shortcuts Disable
// document.addEventListener("keydown", function(event) {
//     if (event.ctrlKey || event.metaKey) {
//         event.preventDefault();
//     }

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
