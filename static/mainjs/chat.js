var currentUser = null;
var socket = null;
var userId = '';
var isMessageSent = false;
var allUsers = []
var serverMessages = [];
var groupedMessages = {};
var selectedUser = {};
var prevUserId = null;
let currentPage = 10;
let callerDeviceType = '';
let receiverDeviceType = '';
let selectedUserFromLocalStorage = {};
let globalMessageType = "";
let globalMessageText = "";
let globalMessageName = "";
let globalMessageUri = "";
let userSessionStatus = "";
let callHistory = [];




//getting selected user from localstorage function start
const setSelectedUserFromLocalStorage = () => {
    try {
        selectedUserFromLocalStorage = JSON.parse(localStorage.getItem('selectedUser'));
        console.log("🚀 ~ setSelectedUserFromLocalStorage ~ selectedUserFromLocalStorage:", selectedUserFromLocalStorage)
    } catch (error) {
        console.log("🚀 ~ setSelectedUserFromLocalStorage ~ error:", error)
    }
};
//getting selected user from localstorage function end


//getting logged in user data functin start
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
        callerDeviceType = data.user.device_type

        if (data?.user) {
            currentUser = {
                ...data.user,
                profileImage: data.user.profile_image
                    ? `https://enigmakey.tech/serv/files/${data.user.profile_image}`
                    : `../static/chatimg/bydefaultimg.png`
            };

            userId = data.user.id;
            console.log("✅ Updated currentUser:", currentUser);

            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            initializeSocket();
        } else {
            console.log("⚠️ User data not found!");
        }

        return currentUser;

    } catch (error) {
        console.log("🚀 ~ getCurrentUserData ~ error:", error);
        return null;
    }
};


getCurrentUserData().then((user) => {
    if (user) {
        console.log("🚀 ~ After async call, currentUser:", user);
        console.log("🚀 ~ After async call, userId:", user.id);
        getAllUsers();
    } else {
        console.log("❌ Failed to fetch user data.");
    }
});
//getting logged in user data functin end

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
            span.textContent = `${user.first_name} ${user.last_name}`;
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


// Function to show a notification start
function sendNotification(senderName, messageType) {
    console.log(currentUser, 'currentUser from notification')
    if (Notification.permission === 'granted') {
        const notification = new Notification(`New Message: ${senderName ? senderName : 'Recieved'}!`, {
            body: `You have received a ${messageType === 'text' ? 'Text Message' : 'File'}...`, //senderMessage
            icon: 'https://via.placeholder.com/100' // Optional icon
        });

        notification.onclick = () => {
            window.focus();
            showCustomAlert('You clicked the notification!');
        };
    } else {
        showCustomAlert('Please grant notification permission first.');
    }
};
// Function to show a notification end


// ✅ **Socket Initialization Function start**
const initializeSocket = () => {
    if (!currentUser) {
        console.error("Socket initialization failed: currentUser is null");
        return;
    }

    // AWS server socket code
    socket = io("https://enigmakey.tech/chat", {
        transports: ["websocket"],
        query: { senderId: currentUser.id },
    });

    socket.on("connect", () => {
        console.log("✅ Connection established with Socket.IO");
        socket.emit("register", { user_id: currentUser.id });
    });

    let messageCount = 0;

    socket.on("new_private_message", (message) => {
        if (!message) {
            console.error("❌ Received an empty message!");
            return;
        }

        console.log("📩 New private message received: is m masla h notify yha use hoa h", message);

        if (message) {
            console.log("senderNAme", message?.senderName)
            sendNotification(message?.senderName, message?.type)
        }

        const senderId = message.sender_id;
        const msgType = message.type;

        console.log(`📩 Type=${msgType}, From=${senderId}`);


        // ✅ Get updated messages from server
        // ✅ Update counter
        messageCount++;
        document.getElementById("counter").innerText = messageCount;

        // ✅ Get updated messages from server

        getMessages();

    });

    socket.on("disconnect", () => {
        console.log("❌ Disconnected from server");
    });

    socket.on("user_status", (data) => {
        Object.entries(data).forEach(([userId, status]) => {
            console.log(`User ${userId} is now ${status}`);
        });
    });

    socket.on("report_status", (data) => {
        Object.entries(data).forEach(([userId, status]) => {
            console.log(`Status of user ${userId}: ${status}`);
        });
    });
};
// ✅ **Socket Initialization Function end**


// Create notification api start

function getUserToken() {
    return localStorage.getItem('access_token');
}

async function createNotification(messageData) {
    console.log("🚀 ~ createNotification ~ messageData:", messageData)
    const token = getUserToken();

    if (!messageData || !token) {
        showCustomAlert('Error: Missing data!');
        return;
    }

    // const { senderId, receiverId, text, type, timestamp, unread } = messageData;

    try {
        const response = await fetch('https://enigmakey.tech/serv/save-chat-history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                sender_id: messageData?.sender_id,
                receiver_id: messageData?.recipient_id,
                message: messageData?.data,
                timestamp: new Date().toISOString(),
                message_type: messageData?.type,
                read_status: false
            })
        });

        if (!response.ok) {
            throw new Error('Failed to send notification');
        }

        console.log('Notification sent successfully', response);
    } catch (error) {
        console.error("🚀 ~ createNotification ~ error:", error);
    }
}

// Create notification api end

// sending message func start
const sendPrivateMessage = async (textMsg) => {
    try {
        // ✅ Debug: Check if `selectedUser` and `currentUser` exist
        if (!selectedUser || !currentUser) {
            throw new Error("❌ selectedUser or currentUser is undefined!");
        }

        // ✅ Debug: Check if `socket` exists
        if (!socket) {
            throw new Error("❌ Socket connection is not established yet!");
        }

        const msg = {
            type: "text",
            data: textMsg,
            recipient_id: selectedUser?.id,
            sender_id: currentUser?.id,
        };

        console.log("📤 Sending message:", msg);
        socket.emit("private_message", msg); // 🔥 Send message via socket
        console.log("✅ Message sent successfully!");
        setTimeout(() => {
            getMessages();
        }, 2000);
        await createNotification(msg);
        isMessageSent = true; // ✅ Mark as message sent
        // ✅ **Now setup the event listeners after sending the message**


    } catch (error) {
        console.error("❌ Error in sendPrivateMessage:", error);
    }
};
// sending message func end

// forwarding message func start
const forwardPrivateMessage = (forwardMsg, selectedUserId) => {
    try {
        // ✅ Debug: Check if `selectedUser` and `currentUser` exist
        if (!selectedUser || !currentUser) {
            throw new Error("❌ selectedUser or currentUser is undefined!");
        }

        // ✅ Debug: Check if `socket` exists
        if (!socket) {
            throw new Error("❌ Socket connection is not established yet!");
        }

        const msg = {
            type: "text",
            data: `\n${forwardMsg}`,
            recipient_id: selectedUserId,
            sender_id: currentUser?.id,
            forward: true
        };

        console.log("📤 Sending message:", msg);
        socket.emit("private_message", msg); // 🔥 Send message via socket
        console.log("✅ Message sent successfully!");
        setTimeout(() => {
            getMessages();
        }, 2000);

        isMessageSent = true; // ✅ Mark as message sent
        // ✅ **Now setup the event listeners after sending the message**



    } catch (error) {
        console.error("❌ Error in sendPrivateMessage:", error);
    }
};
// forwarding message func end




// sending file func start
const sendPrivateFile = (uri, fileName) => {
    try {
        // ✅ Debug: Check if `selectedUser` and `currentUser` exist
        if (!selectedUser || !currentUser) {
            throw new Error("❌ selectedUser or currentUser is undefined!");
        }

        // ✅ Debug: Check if `socket` exists
        if (!socket) {
            throw new Error("❌ Socket connection is not established yet!");
        }

        const msg = {
            type: "file",
            data: uri,
            recipient_id: selectedUser?.id,
            sender_id: currentUser?.id,
            filename: fileName,
        };


        console.log("📤 Sending message:", msg);
        socket.emit("private_message", msg); // 🔥 Send message via socket
        console.log("✅ Message sent successfully!");
        setTimeout(() => {
            getMessages();
        }, 2000);

        isMessageSent = true; // ✅ Mark as message sent
        // ✅ **Now setup the event listeners after sending the message**



    } catch (error) {
        console.error("❌ Error in sendPrivateMessage:", error);
    }
};
// sending file func end

// forwarding file func start
// const forwardPrivateFile = (uri, fileName) => {
//     try {
//         // ✅ Debug: Check if `selectedUser` and `currentUser` exist
//         if (!selectedUser || !currentUser) {
//             throw new Error("❌ selectedUser or currentUser is undefined!");
//         }

//         // ✅ Debug: Check if `socket` exists
//         if (!socket) {
//             throw new Error("❌ Socket connection is not established yet!");
//         }

//         const msg = {
//             type: "file",
//             data: uri,
//             recipient_id: selectedUser?.id,
//             sender_id: currentUser?.id,
//             filename: fileName,
//             forward: true
//         };

//         console.log("📤 Sending message:", msg);
//         socket.emit("private_message", msg); // 🔥 Send message via socket
//         console.log("✅ Message sent successfully!");
//         setTimeout(() => {
//             getMessages();
//         }, 2000);

//         isMessageSent = true; // ✅ Mark as message sent
//         // ✅ **Now setup the event listeners after sending the message**



//     } catch (error) {
//         console.error("❌ Error in sendPrivateMessage:", error);
//     }
// };

const forwardPrivateFile = (uri, fileName, recipientid) => {
    try {
        // ✅ Debug: Check if `selectedUser` and `currentUser` exist
        if (!selectedUser || !currentUser) {
            throw new Error("❌ selectedUser or currentUser is undefined!");
        }

        // ✅ Debug: Check if `socket` exists
        if (!socket) {
            throw new Error("❌ Socket connection is not established yet!");
        }

        const msg = {
            type: "file",
            data: uri,
            recipient_id: recipientid,
            sender_id: currentUser?.id,
            filename: fileName,
            forward: true
        };

        console.log("📤 Sending message:", msg);
        socket.emit("private_message", msg); // 🔥 Send message via socket
        console.log("✅ Message sent successfully!");
        setTimeout(() => {
            getMessages();
        }, 2000);

        isMessageSent = true; // ✅ Mark as message sent
        // ✅ **Now setup the event listeners after sending the message**

        // getMessages();
        // simulateMessageProcessing();


    } catch (error) {
        console.error("❌ Error in sendPrivateMessage:", error);
    }
};
// forwarding file func end

//recieve message func start
const NewMessageReceive = () => {
    if (!socket) {
        console.error("❌ Socket is not initialized!");
        return;
    }

    console.log("✅ NewMessageReceive function initialized");

    // ✅ Ensure event listener is not attached multiple times
    // socket.off("new_private_message"); // Remove previous listener

    socket.on("new_private_message", (message) => {
        if (!message) {
            console.error("❌ Received an empty message!");
            return;
        }

        console.log("📩 New private message received: ye kam karraha h", message);

        const senderId = message.sender_id;
        const msgType = message.type;

        console.log(`📩 Type=${msgType}, From=${senderId}`);

        // ✅ Get updated messages from server
        getMessages();
        simulateMessageProcessing();
    });

    // ✅ Debugging: Check socket connection/disconnection
    socket.on("connect", () => {
        console.log("✅ Socket connected!");
    });

    socket.on("disconnect", () => {
        console.log("❌ Socket disconnected!");
    });
};
//recieve message func start


// ✅ **Setup Message Listeners After Sending Message**
const setupMessageListeners = () => {
    if (!isMessageSent) return; // Ensure message was sent before setting up listeners


    socket.on("message_delivered", (data) => {
        if (data.recipient_id !== currentUser.id) {
            console.log("📩 Message received for recipient:", data.recipient_id);
            NewMessageReceive(); // Recipient ke liye message reflect ho
        } else {
            console.log(`✅ Message to ${data.recipient_id} delivered`);
            getMessages();
            simulateMessageProcessing();
        }
    });



};

// start: Sidebar
// document.querySelector('.chat-sidebar-profile-toggle').addEventListener('click', function (e) {
//     e.preventDefault();
//     this.parentElement.classList.toggle('active');
// });

// document.addEventListener('click', function (e) {
//     if (!e.target.matches('.chat-sidebar-profile, .chat-sidebar-profile *')) {
//         document.querySelector('.chat-sidebar-profile').classList.remove('active');
//     }
// });
// end: Sidebar


// file attachment code start 
function setupFileAttachment() {
    const attachmentBtn = document.querySelector(".attachment-btn");
    const fileInput = document.getElementById("fileInput");
    const previewContainer = document.getElementById("filePreviewContainer");

    attachmentBtn.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", (event) => {
        const files = event.target.files;
        previewContainer.innerHTML = ""; // Clear previous previews

        Array.from(files).forEach((file) => {
            uploadFile(file).then((fileUrl) => {
                // Generate message after upload
                const message = {
                    type: 'file',
                    data: fileUrl,
                    filename: file.name,
                    recipient_id: "agent",  // Ensure `agent` is defined
                    sender_id: "user",      // Ensure `user` is defined
                };

                console.log("Message Generated:", message);
                sendPrivateFile(fileUrl, file.name)
                // You can now send this message through your chat system
            }).catch((error) => {
                console.error("File upload failed:", error);
            });

            // Show file preview
            const fileItem = document.createElement("div");
            fileItem.classList.add("file-preview-item");
            fileItem.textContent = file.name;
            previewContainer.appendChild(fileItem);
        });
    });
}

async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("https://enigmakey.tech/serv/upload", { // Your API endpoint
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Upload failed with status ${response.status}`);
        }

        // Assuming the upload is successful, use the original file name
        return `https://enigmakey.tech/serv/files/${file.name}`;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
}
// file attachment code end 

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

//banner code start
const container = document.getElementById("image-container");
const networkHeading = document.getElementById("network-count"); // Heading ko access karna
async function renderUserImages() {
    container.innerHTML = ""; // Clear previous images

    try {
        const users = await getAllUsers(); // Fetch all users
        const currentUser = await getCurrentUserData(); // Fetch logged-in user

        console.log("Fetched Users for Images:", users);

        const archivedUsers = currentUser?.archive || []; // 🆕 Get archived user IDs

        console.log("Fetched Users for Images:", users);

        // Filter out logged-in user and archived users
        const filteredUsers = users.filter(user =>
            user.id !== currentUser?.id && !archivedUsers.includes(user.id)
        );


        // // Logged-in user ko hatao
        // const filteredUsers = users.filter(user => user.id !== currentUser?.id);

        // 🛠️ Fix: Ab network count correctly show hoga
        networkHeading.textContent = `My Network: ${filteredUsers.length}`;

        if (filteredUsers.length > 0) {
            filteredUsers
                .slice(0, 10) // Limit to 10 users
                .forEach((user, index) => {
                    const imageWrapper = document.createElement("div");
                    imageWrapper.classList.add("network-image-wrapper");
                    // 🛠 User ID ko set karo taake click event me mile
                    imageWrapper.setAttribute("data-id", user.id);

                    const imgElement = document.createElement("img");
                    imgElement.src = user.profile_image
                        ? `https://enigmakey.tech/serv/files/${user.profile_image}`
                        : `../static/chatimg/bydefaultimg.png`;

                    imgElement.alt = `User ${index + 1}`;
                    imgElement.classList.add("network-sender-image");

                    const nameElement = document.createElement("div");
                    nameElement.classList.add("network-user-name");
                    nameElement.textContent = user.username;

                    imageWrapper.appendChild(imgElement);
                    imageWrapper.appendChild(nameElement);
                    container.appendChild(imageWrapper);

                    // 🛠 Click event listener add karna
                    imageWrapper.addEventListener("click", handleUserSelection);

                    // 🆕 Top bar hide karne ke liye:
                    imageWrapper.addEventListener("click", () => {
                        const topBar = document.querySelector(".conversation-top1");
                        if (topBar) {
                            topBar.style.display = "none";
                        }
                    });

                });
        } else {
            container.innerHTML = "<p>No users found!</p>";
        }
    } catch (error) {
        console.error("Error fetching user images:", error);
    }
}

// Call the function to load images
renderUserImages();

//banner code end


// all messages func start
const getMessages = async () => {
    console.log('calling get messages...')
    renderMessages();
    try {
        //const response = await fetch(`${API_BASE_URL}/get_messages`);
        console.log("currentUser", currentUser?.username)
        console.log("selectedUser", selectedUser?.username)
        const response = await fetch(`${API_BASE_URL}/get_messages?name1=${currentUser.username}&name2=${selectedUser.username}&page=${1}&page_size=${currentPage}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("getmessages", data);

        serverMessages = data.messages;


        console.log("🚀 ~ getMessages ~ serverMessages:", serverMessages)

        serverMessages.push(...data.messages);

        simulateMessageProcessing();
    } catch (error) {
        console.error("🚀 ~ getMessages ~ error:", error);
    }
};
// all messages func end

// last message show func start
const getLastMessages = async (cuser, hitUser) => {
    try {
        const response = await fetch(`${API_BASE_URL}/get_messages?name1=${currentUser?.username}&name2=${hitUser}&page=1&page_size=1`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        lastMessagePack = data.messages;
        lastMessage = lastMessagePack;

        return lastMessage


    } catch (error) {
        console.error("🚀 ~ getMessages ~ error:", error);
    }
};
// last message show func end

// Example Usage
getMessages()

// Simulating useEffect behavior allUsers, searchTerm, 
const processMessages = () => {
    console.log('calling processMessages...')
    if (!selectedUser?.id) {
        console.warn("⚠️ No selected user found!");
        return;
    }

    const userMessages = serverMessages.filter(msg => {
        return (
            (msg.senderName === currentUser?.username && msg.receiverName === selectedUser?.username) ||
            (msg.senderName === selectedUser?.username && msg.receiverName === currentUser?.username)
        );
    });


    const sortedMessages = userMessages.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    groupedMessages = sortedMessages.reduce((acc, msg) => {
        const messageDate = new Date(msg.timestamp).toISOString().split('T')[0];
        if (!acc[messageDate]) {
            acc[messageDate] = [];
        }
        acc[messageDate].push(msg);
        return acc;
    }, {});

    // console.log("✅ Updated Grouped Messages:", groupedMessages);
};



const simulateMessageProcessing = () => {
    console.log('calling simulateMessageProcessing...')

    if (!selectedUser?.id) {
        console.warn("⚠️ simulateMessageProcessing aborted: No user selected.");
        return;
    }

    processMessages(); // ✅ Process messages immediately
    renderConversation(groupedMessages);
};



// Render Users list
const messagesList = document.getElementById("messagesList");

async function getSessionToken() {
    try {
        const response = await fetch('/session-data'); // Fetch session data
        const data = await response.json();

        if (response.ok && data.success && data.user_data?.access_token) {
            return data.user_data.access_token; // Return the valid token
        } else {
            console.error("Failed to retrieve access token:", data);
            return null;
        }
    } catch (error) {
        console.error("Error fetching session data:", error);
        return null;
    }
}

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


// ✅ Archive a user func start
async function archiveUser(userId) {
    try {
        const token = await getSessionToken();
        if (!token) {
            showCustomAlert("Authorization token is missing. Please log in again.");
            return;
        }

        const response = await fetch('https://enigmakey.tech/serv/archive-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ user_id: userId })
        });

        const data = await response.json();
        if (response.ok) {
            console.log("User successfully archived!");
            // Show toast only once
            showToastOnceOnly("Successfully archived!");

            setTimeout(async () => {
                await window.location.reload(); // 🔄 Refresh active users
            }, 2000);
        } else {
            showCustomAlert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error("Error archiving user:", error);
    }
}
// ✅ Archive a user func end

// start star user func
async function starUser(userId) {
    try {
        const token = await getSessionToken();
        if (!token) {
            showCustomAlert("Authorization token is missing. Please log in again.");
            return;
        }

        const response = await fetch('https://enigmakey.tech/serv/star-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ user_id: userId })
        });

        const data = await response.json();
        if (response.ok) {
            console.log("User successfully Star!");

            // Show toast only once
            showToastOnceOnly("Successfully Star!");

            setTimeout(async () => {
                // Refresh active users after the toast
                await window.location.reload();
                await renderMessages(); // 🔄 Refresh active users
                //wait renderArchivedUsers(); // 🔄 Refresh archived users
            }, 2000); // Adjust delay time (2000ms = 2s)
        } else {
            showCustomAlert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error("Error archiving user:", error);
    }
}
// end star user func


// ✅ Remove a user from archive func start
async function removeFromArchive(userId) {
    try {
        const token = await getSessionToken();
        if (!token) {
            showCustomAlert("Authorization token is missing. Please log in again.");
            return;
        }

        const response = await fetch('https://enigmakey.tech/serv/remove-archive-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ user_id: userId })
        });

        const data = await response.json();
        if (response.ok) {
            console.log("User removed from archive!");

            // Show toast only once
            showToastOnceOnly("User removed from star!");

            setTimeout(async () => {
                //await renderMessages(); // 🔄 Refresh active users
                await renderArchivedUsers(); // 🔄 Refresh archived users
            }, 2000); // Adjust delay time (500ms = 0.5s)
        } else {
            showCustomAlert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error("Error removing user from archive:", error);
    }
}
// ✅ Remove a user from archive func end

//start Function to show toast only once, based on the flag
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

// ✅ Remove a user from star func start
async function removeFromStar(userId) {
    let isToastActive = false;
    try {
        const token = await getSessionToken();
        if (!token) {
            showCustomAlert("Authorization token is missing. Please log in again.");
            return;
        }

        const response = await fetch('https://enigmakey.tech/serv/remove-star-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ user_id: userId })
        });

        const data = await response.json();
        if (response.ok) {
            console.log("User removed from star!");

            // Show toast only once
            showToastOnceOnly("User removed from star!");

            setTimeout(async () => {
                // Refresh active users after the toast
                await window.location.reload();
                await renderMessages(); // 🔄 Refresh archived users
            }, 2000); // Adjust delay time (2000ms = 2s)
        } else {
            showCustomAlert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error("Error removing user from archive:", error);
    }
}
// ✅ Remove a user from star func end

// start func removeFromStarAndRenderStared
async function removeFromStarAndRenderStared(userId) {
    try {
        const token = await getSessionToken();
        if (!token) {
            showCustomAlert("Authorization token is missing. Please log in again.");
            return;
        }

        const response = await fetch('https://enigmakey.tech/serv/remove-star-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ user_id: userId })
        });

        const data = await response.json();
        if (response.ok) {
            console.log("User removed from star!");
            // Show toast only once
            showToastOnceOnly("User removed from star!");
            setTimeout(async () => {
                //await renderMessages(); // 🔄 Refresh active users
                await renderStaredUsers(); // 🔄 Refresh archived users
            }, 2000); // Adjust delay time (500ms = 0.5s)
        } else {
            showCustomAlert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error("Error removing user from archive:", error);
    }
}
// end func removeFromStarAndRenderStared

// ✅ Function to Get Cookie Value by Name start
function getCookie(name) {
    const cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName === name) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null; // Return null if the cookie is not found
}
// ✅ Function to Get Cookie Value by Name start

// ✅ Remove selectedUser on page refresh
window.addEventListener("beforeunload", () => {
    document.cookie = "selectedUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // localStorage.removeItem("selectedUser");
});

// ✅ Get selected user from cookie
const selectedUserr = getCookie("selectedUser");
console.log("📌 Selected User in call.js:", JSON.parse(selectedUserr));

let parsedUser = null;
if (selectedUserr) {
    try {
        parsedUser = JSON.parse(selectedUserr); // ✅ Parse JSON data
    } catch (error) {
        console.error("❌ Error parsing selected user:", error);
    }
}

// ✅ If a valid user is found, process it
if (parsedUser) {
    console.log("🟢 User ID:", parsedUser.id);
    console.log("🟢 Username:", parsedUser.username);

    // ✅ Call handleUserSelection when selectedUserr is true
    handleUserSelection({ preventDefault: () => { }, target: { closest: () => ({ getAttribute: () => parsedUser.id }) } });
}

async function getCallHistory() {
    try {
        const token = localStorage.getItem('access_token'); // Replace AsyncStorage with localStorage if needed
        const userName = localStorage.getItem('userName');

        if (!token || !userName) {
            console.error("❌ Missing token or username!");
            return [];
        }

        const response = await fetch(
            `http://enigmakey.tech/serv/get_call_logs?username=${userName}&page=1&limit=100`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        if (!response.ok) {
            console.error("❌ API Error:", response.status);
            return [];
        }

        const data = await response.json();
        console.log("🚀 ~ Call History Data:", data);

        return Array.isArray(data) ? data : []; // Ensure an array is returned
    } catch (error) {
        console.error("❌ API Fetch Error:", error);
        return [];
    }
}

document.addEventListener("click", async (event) => {

    const messageItem = event.target.closest(".message-item");
    console.log("🚀 ~ document.addEventListener ~ messageItem:", messageItem)
    if (!messageItem) return;

    event.preventDefault();

    const notificationId = messageItem.getAttribute("data-notification");


    if (!notificationId) {
        console.error("❌ No notificationId found in clicked item.");
        return;
    }

    console.log("🔔 Notification ID:", notificationId);

    const call = callHistory.find(c => c.notification_id === notificationId);

    console.log("✅ call User:", call);

    // ✅ **Agar pehle se read hai to API skip karo, magar navigate aur cookie store karo**
    if (call?.read_status) {
        console.log("⚠️ Call already read, skipping API call.");
        return;
    }

    await updateCallReadStatus(notificationId);

});

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
            console.log("Response Status:", response.status); // Log the status

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            console.log("✅ Call read status updated successfully");

        } else {
            showCustomAlert("Something is missing");
        }
    } catch (error) {
        console.error("🚀 ~ updateCallReadStatus ~ error:", error);
    }
}





function timeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return `${seconds} sec ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
}
// // func of rendermessages start
// async function renderMessages() {
//     messagesList.innerHTML = ""; // Clear existing messages

//     try {
//         const users = await getAllUsers(); // Fetch users
//         console.log("Fetched Users:", users);

//         // Get the current logged-in user
//         const starredUsers = currentUser?.star || []; // Extract starred users list
//         const archivedUsers = currentUser?.archive || []; // Extract archived users list

//         if (users.length > 0) {
//             for (const user of users) {
//                 if (archivedUsers.includes(user.id)) continue; // 🚀 Skip archived users

//                 if (!user.first_name || !user.last_name) continue;

//                 const lastMessage = await getLastMessages(currentUser?.username, user?.username);
//                 let lm = "No Message Yet!";

//                 lastMessage.forEach((msg) => {
//                     if (msg.type === "file") {
//                         lm = "New File!";
//                     } else if (msg.type === "text") {
//                         lm = msg.text;
//                     }
//                 });

//                 // Determine lock/unlock icon based on archive status
//                 const isStarred = starredUsers.includes(user.id);
//                 const starIcon = isStarred ? "../static/chatimg/star.png" : "../static/chatimg/unstar.png";

//                 const listItem = document.createElement("li");
//                 listItem.innerHTML = `
//                 <a data-id="${user.id}" class="message-item no-hover-effect">
//                 <div class="image-wrapper">
//                 <div class="content-image">
//                         <img class="sender-image" src="${user.profile_image ? `https://enigmakey.tech/serv/files/${user?.profile_image}` : `../static/chatimg/bydefaultimg.png`}" alt="">
//                     </div>
//                 </div>
//                     <span class="content-message-info">
//                         <span class="content-message-name">${user.first_name} ${user.last_name}</span>
//                         <span class="content-message-text">${lm}</span>
//                     </span>
//                     <div class="message-images">
//                         <img src="${starIcon}" alt="Star User" class="star-user" data-id="${user.id}" style="cursor: pointer;">
//                         <img src="../static/chatimg/lock (1).png" alt="Archive" class="archive-user" data-id="${user.id}" style="cursor: pointer;">
//                     </div>
//                 </a>
//                 `;

//                 // 👇 Add this:
//                 listItem.addEventListener("click", () => {
//                     const topBar = document.querySelector(".conversation-top1");
//                     if (topBar) {
//                         topBar.style.display = "none";
//                     }
//                 });

//                 messagesList.appendChild(listItem);
//             }

//             // Attach event listeners to star/unstar buttons
//             document.querySelectorAll('.star-user').forEach(button => {
//                 button.addEventListener('click', async (event) => {
//                     event.stopPropagation();
//                     const userId = event.target.dataset.id;
//                     const isStarred = starredUsers.includes(userId);

//                     if (isStarred) {
//                         await removeFromStar(userId);
//                     } else {
//                         await starUser(userId);
//                     }
//                 });
//             });

//             // Attach event listeners to archive buttons
//             document.querySelectorAll('.archive-user').forEach(button => {
//                 button.addEventListener('click', async (event) => {
//                     event.stopPropagation();
//                     const userId = event.target.dataset.id;
//                     await archiveUser(userId);
//                 });
//             });

//         } else {
//             messagesList.innerHTML = `<li><span class="no-data-message">No data found!</span></li>`;
//         }
//     } catch (error) {
//         console.error("❌ Error fetching messages:", error);
//     }
// }
// // func of rendermessages end

async function renderMessages(type = "chat", searchQuery = "") {
    messagesList.innerHTML = ""; // Clear existing messages

    try {
        const [users, fetchedCallHistory] = await Promise.all([getAllUsers(), getCallHistory()]);
        const callHistory = fetchedCallHistory;

        const currentUserData = localStorage.getItem("currentUser");
        const currentUser = currentUserData ? JSON.parse(currentUserData) : null;
        const loggedInUsername = currentUser?.username || "";
        const starredUsers = currentUser?.star || [];
        const archivedUsers = currentUser?.archive || [];

        const usersMap = new Map(users.map(user => [user.username, user]));

        // -----------------------------------
        // 🟡 Type: CALL UI
        // -----------------------------------
        if (type === "call") {
             messagesList.innerHTML = ""; // 🧹 CLEAR for calls
            const filteredCalls = callHistory.filter(call => {
                const caller = usersMap.get(call.caller?.username);
                const callerName = caller?.username || call.caller?.username || "";

                return callerName !== loggedInUsername &&
                    (searchQuery ? callerName.toLowerCase().includes(searchQuery.toLowerCase()) : true);
            });

            if (filteredCalls.length === 0) {
                messagesList.innerHTML = `<li><span class="no-data-message">No data found!</span></li>`;
                return;
            }

            for (const call of filteredCalls) {
                const isRead = call.read_status;
                const caller = usersMap.get(call.caller?.username);
                const userId = caller?.id || "unknown";
                const callerName = caller?.username || "Unknown Caller";
                const callDate = new Date(call.call_time);
                const formattedTime = timeAgo(callDate);

                const profileImage = caller?.profile_image
                    ? `https://enigmakey.tech/serv/files/${caller.profile_image}`
                    : `../static/chatimg/bydefaultimg.png`;

                const callImage = call.call_type === "video"
                    ? `<img src="../static/chatimg/videocallimg.png" alt="Video Call" class="call-icon" style="cursor: pointer;">`
                    : `<img src="../static/chatimg/Calls.png" alt="Audio Call" class="call-icon" style="cursor: pointer;">`;

                const listItem = document.createElement("li");
                listItem.className = "message-item" + (!isRead ? " active" : "");
                listItem.innerHTML = `
                    <a data-id="${userId}" data-notification="${call.notification_id}" class="message-item no-hover-effect">
                        <div class="image-wrapper">
                            <div class="content-image">
                                <img class="sender-image" src="${profileImage}" alt="Profile Image">
                            </div>
                        </div>
                        <span class="content-message-info">
                            <span class="content-message-name">${callerName}</span>
                            <span class="content-message-text">${formattedTime}</span> 
                        </span>
                        <div class="message-images">${callImage}</div>
                    </a>
                `;

                listItem.addEventListener("click", () => {
                    const topBar = document.querySelector(".conversation-top1");
                    if (topBar) topBar.style.display = "none";
                });

                messagesList.appendChild(listItem);
            }

            return; // ✅ Return after rendering calls
        }

        // -----------------------------------
        // 🟢 Type: CHAT UI
        // -----------------------------------
      for (const user of users) {
    if (archivedUsers.includes(user.id)) continue;
    if (!user.first_name || !user.last_name) continue;

    const isStarred = starredUsers.includes(user.id);
    const starIcon = isStarred ? "../static/chatimg/star.png" : "../static/chatimg/unstar.png";

    const listItem = document.createElement("li");
    listItem.innerHTML = `
        <a data-id="${user.id}" class="message-item no-hover-effect">
            <div class="image-wrapper">
                <div class="content-image">
                    <img class="sender-image" src="${user.profile_image ? `https://enigmakey.tech/serv/files/${user.profile_image}` : `../static/chatimg/bydefaultimg.png`}" alt="">
                </div>
            </div>
            <span class="content-message-info">
                <span class="content-message-name">${user.first_name} ${user.last_name}</span>
                <span class="content-message-text loading-message">Loading...</span>
            </span>
            <div class="message-images">
                <img src="${starIcon}" alt="Star User" class="star-user" data-id="${user.id}" style="cursor: pointer;">
                <img src="../static/chatimg/lock (1).png" alt="Archive" class="archive-user" data-id="${user.id}" style="cursor: pointer;">
            </div>
        </a>
    `;

    messagesList.appendChild(listItem);

    // Async fetch without awaiting here
    getLastMessages(currentUser?.username, user?.username).then(lastMessage => {
        let lm = "No Message Yet!";
        lastMessage.forEach((msg) => {
            if (msg.type === "file") {
                lm = "New File!";
            } else if (msg.type === "text") {
                lm = msg.text;
            }
        });

        // Update the specific element's message
        const messageTextEl = listItem.querySelector(".content-message-text");
        if (messageTextEl) messageTextEl.textContent = lm;
    }).catch(() => {
        const messageTextEl = listItem.querySelector(".content-message-text");
        if (messageTextEl) messageTextEl.textContent = "Failed to load message.";
    });

    // Add event listener
    listItem.addEventListener("click", () => {
        const topBar = document.querySelector(".conversation-top1");
        if (topBar) topBar.style.display = "none";
    });
}


        // Star/Archive Listeners
        document.querySelectorAll('.star-user').forEach(button => {
            button.addEventListener('click', async (event) => {
                event.stopPropagation();
                const userId = event.target.dataset.id;
                const isStarred = starredUsers.includes(userId);
                isStarred ? await removeFromStar(userId) : await starUser(userId);
            });
        });

        document.querySelectorAll('.archive-user').forEach(button => {
            button.addEventListener('click', async (event) => {
                event.stopPropagation();
                const userId = event.target.dataset.id;
                await archiveUser(userId);
            });
        });

    } catch (error) {
        console.error("❌ Error fetching messages/calls:", error);
    }
}


// ✅ Render only archived users
async function renderArchivedUsers() {
    console.log("renderArchivedUsers()")
    messagesList.innerHTML = ""; // Clear existing messages

    try {
        const users = await getAllUsers(); // Fetch users
        console.log("Fetched Users:", users);

        // Get the current logged-in user
        const archivedUsers = currentUser?.archive || []; // Extract archived users list
        console.log("archivedUsers", archivedUsers)
        if (users.length > 0) {
            for (const user of users) {
                if (!archivedUsers.includes(user.id)) continue; // 🚀 Skip archived users

                const lastMessage = await getLastMessages(currentUser?.username, user?.username);
                let lm = "No Message Yet!";

                lastMessage.forEach((msg) => {
                    if (msg.type === "file") {
                        lm = "New File!";
                    } else if (msg.type === "text") {
                        lm = msg.text;
                    }
                });

                const listItem = document.createElement("li");
                listItem.innerHTML = `
                <a href="#" data-id="${user.id}" class="message-item">
                    <div class="content-image">
                        <img class="content-message-image" src="${user.profile_image ? `https://enigmakey.tech/serv/files/${user?.profile_image}` : `../static/chatimg/bydefaultimg.png`}" alt="">
                    </div>
                    <span class="content-message-info">
                        <span class="content-message-name">${user.first_name} ${user.last_name}</span>
                        <span class="content-message-text">${lm}</span>
                    </span>
                    <div class="message-images">
                        <img src="../static/chatimg/unlock.png" alt="Archive" class="remove-archive-user" data-id="${user.id}" style="cursor: pointer;">
                    </div>
                </a>
                `;
                messagesList.appendChild(listItem);
            }

            // Attach event listeners to archive buttons
            document.querySelectorAll('.remove-archive-user').forEach(button => {
                button.addEventListener('click', async (event) => {
                    event.stopPropagation();
                    const userId = event.target.dataset.id;
                    await removeFromArchive(userId);
                });
            });

        } else {
            messagesList.innerHTML = `<li><span class="no-data-message">No data found!</span></li>`;
        }
    } catch (error) {
        console.error("❌ Error fetching messages:", error);
    }
}

// ✅ Render only archived users
async function renderStaredUsers() {
    console.log("renderStaredUsers()")
    messagesList.innerHTML = ""; // Clear existing messages

    try {
        const users = await getAllUsers(); // Fetch users
        console.log("Fetched Users:", users);

        // Get the current logged-in user
        const staredUsers = staredUsers?.archive || []; // Extract archived users list
        console.log("staredUsers", staredUsers)
        if (users.length > 0) {
            for (const user of users) {
                if (!staredUsers.includes(user.id)) continue; // 🚀 Skip archived users

                const lastMessage = await getLastMessages(currentUser?.username, user?.username);
                let lm = "No Message Yet!";

                lastMessage.forEach((msg) => {
                    if (msg.type === "file") {
                        lm = "New File!";
                    } else if (msg.type === "text") {
                        lm = msg.text;
                    }
                });

                const listItem = document.createElement("li");
                listItem.innerHTML = `
            <a href="#" data-id="${user.id}" class="message-item">
                <div class="content-image">
                    <img class="content-message-image" src="${user.profile_image ? `https://enigmakey.tech/serv/files/${user?.profile_image}` : `../static/chatimg/bydefaultimg.png`}" alt="">
                </div>
                <span class="content-message-info">
                    <span class="content-message-name">${user.first_name} ${user.last_name}</span>
                    <span class="content-message-text">${lm}</span>
                </span>
                <div class="message-images">
                    <img src="../static/chatimg/unlock.png" alt="Archive" class="remove-archive-user" data-id="${user.id}" style="cursor: pointer;">
                </div>
            </a>
            `;
                messagesList.appendChild(listItem);
            }

            // Attach event listeners to archive buttons
            document.querySelectorAll('.remove-archive-user').forEach(button => {
                button.addEventListener('click', async (event) => {
                    event.stopPropagation();
                    const userId = event.target.dataset.id;
                    await removeFromArchive(userId);
                });
            });

        } else {
            messagesList.innerHTML = `<li><span class="no-data-message">No data found!</span></li>`;
        }
    } catch (error) {
        console.error("❌ Error fetching messages:", error);
    }
}

// ✅ Render only starred users
async function renderStaredUsers() {
    console.log("renderStaredUsers()");
    messagesList.innerHTML = ""; // Clear existing messages

    try {
        const users = await getAllUsers(); // Fetch users
        console.log("Fetched Users:", users);

        // Get the current logged-in user
        const starredUsers = currentUser?.star || []; // Extract starred users list
        console.log("Starred Users:", starredUsers);

        if (starredUsers.length > 0) {
            for (const user of users) {
                if (!starredUsers.includes(user.id)) continue; // 🚀 Skip non-starred users

                const lastMessage = await getLastMessages(currentUser?.username, user?.username);
                let lm = "No Message Yet!";

                lastMessage.forEach((msg) => {
                    if (msg.type === "file") {
                        lm = "New File!";
                    } else if (msg.type === "text") {
                        lm = msg.text;
                    }
                });

                const listItem = document.createElement("li");
                listItem.innerHTML = `
                <a  data-id="${user.id}" class="message-item">
                    <div class="content-image">
                        <img class="content-message-image" src="${user.profile_image ? `https://enigmakey.tech/serv/files/${user?.profile_image}` : `../static/chatimg/bydefaultimg.png`}" alt="">
                    </div>
                    <span class="content-message-info">
                        <span class="content-message-name">${user.first_name} ${user.last_name}</span>
                        <span class="content-message-text">${lm}</span>
                    </span>
                    <div class="message-images">
                        <img src="../static/chatimg/star.png" alt="Unstar" class="unstar-user" data-id="${user.id}" style="cursor: pointer;">
                    </div>
                </a>
                `;
                messagesList.appendChild(listItem);
            }

            // Attach event listeners to unstar buttons
            document.querySelectorAll('.unstar-user').forEach(button => {
                button.addEventListener('click', async (event) => {
                    event.stopPropagation();
                    const userId = event.target.dataset.id;
                    await removeFromStarAndRenderStared(userId);
                });
            });

        } else {
            messagesList.innerHTML = `<li><span class="no-data-message">No starred users!</span></li>`;
        }
    } catch (error) {
        console.error("❌ Error fetching starred users:", error);
    }
}


// Initial rendering of all messages
renderMessages();
//renderArchivedUsers();
//renderStaredUsers();

// func to handle selected user in call.js chat.js start
function handleUserSelection(event) {
    console.log("User selected:", event.target);
    event.preventDefault();

    // ✅ Pehle a tag ko check karo, agar na mile to div check karo
    const target = event.target.closest("a") || event.target.closest(".network-image-wrapper");
    if (!target) return;

    const id = target.getAttribute("data-id");
    console.log("🔍 Checking userID:", id);

    if (id === selectedUser?.id) return; // ✅ Skip if the same user is clicked again

    getAllUsers().then(users => {
        const user = users.find(u => u.id === id);
        console.log('  const user = users.find(u => u.id === id);', user)
        receiverDeviceType = user.device_type
        if (user) {
            selectedUser = {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                username: user.username,
                profileImage: user.profile_image
                    ? `https://enigmakey.tech/serv/files/${user.profile_image}`
                    : `../static/chatimg/bydefaultimg.png`
            };

            console.log("🆕 Selected User Updated:", selectedUser);

            localStorage.setItem('selectedUser', JSON.stringify(selectedUser));

            // ✅ Hide the conversation-top1 bar when a user is selected
            const topBar = document.querySelector('.conversation-top1');
            if (topBar) {
                topBar.style.display = "none";
            }


            // ✅ Process messages for the new user
            processUserMessages();
        }
    });
}
// func to handle selected user in call.js chat.js start

// ✅ Function to Process Messages
function processUserMessages() {
    getMessages();
    processMessages();
    simulateMessageProcessing();
    renderConversation(groupedMessages);
}

// ✅ Attach Event Listener
messagesList.addEventListener("click", handleUserSelection);


const seeMoreButtonHandler = () => {
    console.log("see more")
    currentPage += 2;  // Increment the current page
    console.log(currentPage);
    setTimeout(() => {
        getMessages();
    }, 500);
    // getMessages();
};

// Handle Forward and Delete Button Actions func start

let shouldShowOptions = false;

function toggleOptions(event) {
    // When clicked, set shouldShowOptions to true
    shouldShowOptions = true;

    // Prevent closing when clicking inside the button
    if (event.target.closest('.forward-btn') || event.target.closest('.delete-btn')) {
        return; // Do nothing if clicked inside the button
    }

    event.stopPropagation(); // Prevent closing when clicking inside the message div


    document.getElementById('myModal').addEventListener('shown.bs.modal', function () {
        const userListContainer = document.getElementById('userList');
        if (userListContainer.children.length === 0) { // Prevent duplicate users
            generateUserList(globalMessageType, globalMessageText, globalMessageName, globalMessageUri);
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



    // Get the parent container of the message
    const conversationItem = event.currentTarget.closest(".conversation-item");
    const optionsContainer = conversationItem.querySelector(".options-container");
    // const messageTextt = conversationItem.querySelector(".conversation-item-text").textContent;
    const messageText = conversationItem.getAttribute("data-message-text");
    const messageId = conversationItem.getAttribute("data-message-id");
    const messageType = conversationItem.getAttribute("data-message-type"); // NEW: Get message type
    const messageName = conversationItem.getAttribute("data-message-name");
    const messageUri = conversationItem.getAttribute("data-message-uri");

    // Log message type to console
    console.log("Message Type:", messageType); // NEW: Log the message type
    console.log("Message name:", messageName); // NEW: Log the message name
    console.log("Message uri:", messageUri); // NEW: Log the message name




    // Store message text inside the buttons for forward and delete
    const forwardBtn = optionsContainer.querySelector(".forward-btn");
    const deleteBtn = optionsContainer.querySelector(".delete-btn");
    const openBtn = optionsContainer.querySelector(".open-btn"); // ✅ New

    // ✅ Check file extension from URI
    const fileExt = messageUri?.split('.').pop().toLowerCase();

    // Pass messageId to the buttons
    forwardBtn.setAttribute("data-message-text", messageText);
    forwardBtn.setAttribute("data-message-type", messageType); // NEW: Pass type to forward button
    forwardBtn.setAttribute("data-message-name", messageName);
    forwardBtn.setAttribute("data-message-uri", messageUri);
    deleteBtn.setAttribute("data-message-id", messageId);

    // ✅ Set data for open button
    // ✅ Conditionally show/hide Open button
    // Hide Open button for text or audio files
    if (messageType === "text" || ["mp3", "wav", "ogg"].includes(fileExt)) {
        openBtn.style.display = "none";
    } else {
        openBtn.style.display = "inline-block";
        openBtn.setAttribute("data-message-type", messageType);
        openBtn.setAttribute("data-message-name", messageName);
        openBtn.setAttribute("data-message-uri", messageUri);
    }

    // Show the options (forward and delete buttons) for the current message
    optionsContainer.style.display = "block"; // Show buttons

    // Hide all other options containers
    document.querySelectorAll(".options-container").forEach(container => {
        if (container !== optionsContainer) {
            container.style.display = "none"; // Hide other options containers
        }
    });
}


// function toggleOptions(event) {
//     // When clicked, set shouldShowOptions to true
//     shouldShowOptions = true;

//     // Prevent closing when clicking inside the button
//     if (event.target.closest('.forward-btn') || event.target.closest('.delete-btn')) {
//         return; // Do nothing if clicked inside the button
//     }

//     event.stopPropagation(); // Prevent closing when clicking inside the message div


//     document.getElementById('myModal').addEventListener('shown.bs.modal', function () {
//         const userListContainer = document.getElementById('userList');
//         if (userListContainer.children.length === 0) { // Prevent duplicate users
//             generateUserList();
//         }
//     });

//     // Close modal properly and restore page functionality
//     document.addEventListener('hidden.bs.modal', function () {
//         document.body.classList.remove('modal-open'); // Remove Bootstrap's modal-open class
//         document.body.style.overflow = ''; // Restore scrolling

//         // Remove any extra modal backdrop
//         document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
//             backdrop.remove();
//         });

//         // 🔥 Clean user list when modal closes (optional)
//         document.getElementById('userList').innerHTML = '';
//     });



//     // Get the parent container of the message
//     const conversationItem = event.currentTarget.closest(".conversation-item");
//     const optionsContainer = conversationItem.querySelector(".options-container");
//     // const messageTextt = conversationItem.querySelector(".conversation-item-text").textContent;
//     const messageText = conversationItem.getAttribute("data-message-text");
//     const messageId = conversationItem.getAttribute("data-message-id");

//     // Store message text inside the buttons for forward and delete
//     const forwardBtn = optionsContainer.querySelector(".forward-btn");
//     const deleteBtn = optionsContainer.querySelector(".delete-btn");

//     // Pass messageId to the buttons
//     forwardBtn.setAttribute("data-message-text", messageText);
//     deleteBtn.setAttribute("data-message-id", messageId);

//     // Show the options (forward and delete buttons) for the current message
//     optionsContainer.style.display = "block"; // Show buttons

//     // Hide all other options containers
//     document.querySelectorAll(".options-container").forEach(container => {
//         if (container !== optionsContainer) {
//             container.style.display = "none"; // Hide other options containers
//         }
//     });
// }





// function toggleFileOptions(event) {
//     // Stop if click happened inside media or waveform controls
//     if (
//         event.target.closest(".audio-message") || 
//         event.target.closest(".file-preview-video") || 
//         event.target.closest(".waveform") || 
//         event.target.closest(".audio-play-button") ||
//         event.target.closest(".file-preview-document") || 
//         event.target.closest(".file-preview-default") || 
//         event.target.tagName === "IFRAME"
//     ) {
//         return; // Don't trigger options for media clicks
//     }

//     shouldShowOptions = true;

//     if (event.target.closest('.forward-btn') || event.target.closest('.delete-btn')) {
//         return;
//     }

//     event.stopPropagation();

//     document.getElementById('myModal').addEventListener('shown.bs.modal', function () {
//         const userListContainer = document.getElementById('userList');
//         if (userListContainer.children.length === 0) {
//             generateUserList();
//         }
//     });

//     document.addEventListener('hidden.bs.modal', function () {
//         document.body.classList.remove('modal-open');
//         document.body.style.overflow = '';
//         document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
//         document.getElementById('userList').innerHTML = '';
//     });

//     const conversationItem = event.currentTarget.closest(".conversation-item");
//     const optionsContainer = conversationItem.querySelector(".options-container");
//     const messageText = conversationItem.getAttribute("data-message-text");
//     const messageId = conversationItem.getAttribute("data-message-id");

//     const forwardBtn = optionsContainer.querySelector(".forward-btn");
//     const deleteBtn = optionsContainer.querySelector(".delete-btn");
//     forwardBtn.setAttribute("data-message-text", messageText);
//     deleteBtn.setAttribute("data-message-id", messageId);

//     optionsContainer.style.display = "block";

//     document.querySelectorAll(".options-container").forEach(container => {
//         if (container !== optionsContainer) {
//             container.style.display = "none";
//         }
//     });
// }

// Close options when clicking anywhere outside



document.addEventListener("click", (e) => {
    // Check if the click happened outside the message or options container
    if (!e.target.closest('.conversation-item-text') && !e.target.closest('.options-container')) {
        // Hide all options containers
        document.querySelectorAll(".options-container").forEach(container => {
            container.style.display = "none"; // Hide options
        });
        // Reset shouldShowOptions to false
        shouldShowOptions = false;
    }
});


// function forwardMessage(event) {
//     // ✅ Clicked button se message ID lo
//     const messageText = event.currentTarget.getAttribute("data-message-text");

//     if (messageText) {
//         // ✅ Modal me ID show karo
//         document.getElementById("selectedMessageId").textContent = "Message ID: " + messageText;
//         console.log("Forwarding message with ID:", messageText);
//     } else {
//         console.log("Message ID not found!");
//     }
// }


function forwardMessage(event) {
    const forwardBtn = event.target.closest('.forward-btn');

    const messageText = forwardBtn.getAttribute("data-message-text");
    const messageType = forwardBtn.getAttribute("data-message-type");
    const messageName = forwardBtn.getAttribute("data-message-name");
    const messageUri = forwardBtn.getAttribute("data-message-uri");

    // 🔥 Store in global variables
    globalMessageType = messageType;
    globalMessageText = messageText;
    globalMessageName = messageName;
    globalMessageUri = messageUri;

    // // Optional: update UI
    // document.getElementById("selectedMessageType").textContent = "Type: " + messageType;
    // document.getElementById("selectedMessageText").textContent = "Text: " + messageText;
    // document.getElementById("selectedMessageName").textContent = "File Name: " + messageName;
    // document.getElementById("selectedMessageUri").textContent = "URI: " + messageUri;
    // document.getElementById("selectedMessageId").textContent = "Message: " + (messageType === "file" ? messageUri : messageText);

    // ✅ Now show modal (if you're manually opening it)
    // $('#myModal').modal('show');
    generateUserList(globalMessageType, globalMessageText, globalMessageName, globalMessageUri);
}


function deleteMessage(event) {
    const messageId = event.currentTarget.getAttribute("data-message-id");

    if (!messageId) {
        console.error("Error: Message ID not found!");
        return;
    }

    console.log("Deleting message with ID:", messageId);

    fetch(`https://enigmakey.tech/serv/delete_message_by_id?messageId=${messageId}`, {
        method: "DELETE",
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Message deleted successfully:", data);

            // Find and remove message using data-message-id
            const messageElem = document.querySelector(`.conversation-item[data-message-id="${messageId}"]`);
            if (messageElem) {
                messageElem.remove();
            } else {
                console.warn("Message element not found in DOM for ID:", messageId);
            }
        })
        .catch(error => {
            console.error("Error deleting message:", error);
        });
};

// Handle Forward and Delete Button Actions func end


function openFile(event) {
    const openBtn = event.target.closest('.open-btn');
    const fileType = openBtn.getAttribute("data-message-type");
    const fileUri = openBtn.getAttribute("data-message-uri");
    const fileName = openBtn.getAttribute("data-message-name") || "Unknown";

    const modalBody = document.getElementById("openFileModalBody");

    // Clear previous content
    modalBody.innerHTML = "";

    // File extension
    const fileExtension = fileUri.split('.').pop().toLowerCase();

    // Show content based on file type
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension)) {
        modalBody.innerHTML = `<img src="${fileUri}" alt="${fileName}" class="img-fluids" />`;
    } else if (fileExtension === "pdf") {
        modalBody.innerHTML = `<iframe src="${fileUri}" width="100%" height="500px" style="border:none;"></iframe>`;
    } else {
        // modalBody.innerHTML = `
        //     <p>Unable to preview this file type. You can download it instead:</p>
        //     <a href="${fileUri}" class="btn btn-primary" target="_blank" download>Download ${fileName}</a>
        // `;
        // ✅ Default file preview - styled like PDF block
        modalBody.innerHTML = `
            <div style="text-align: center;">
                <img src="../static/chatimg/media.jpg" alt="File Icon" style="width: 80px; margin-bottom: 15px;">
                <h5>${fileName}</h5>
                <p>This file type can't be previewed, but you can download it below.</p>
                <a href="${fileUri}" class="btn btn-primary mt-2" target="_blank" download style="width: 410px; display: inline-block;">Download ${fileName}</a>
            </div>
        `;
    }

    // else {
    //     modalBody.innerHTML = `
    //         <p>Unable to preview this file type. You can download it instead:</p>
    //         <a href="${fileUri}" class="btn btn-primary" target="_blank" download>Download ${fileName}</a>
    //     `;
    // }

    // Open modal manually using Bootstrap
    const modal = new bootstrap.Modal(document.getElementById("openFileModal"));
    modal.show();
}


const sendUserData = async () => {
    try {
        if (!currentUser || !selectedUser) {
            console.error("Users not found!");
            return;
        }

        const response = await fetch('/images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                currentUserr: currentUser.username,
                selectedUserr: selectedUser.username
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Response me HTML milega, usko page replace kar do
        const html = await response.text();
        document.open();
        document.write(html);
        document.close();

    } catch (error) {
        console.error("Error sending user data:", error);
    }
};


async function getUsersStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/user_status`);
        const data = await response.json();
        updateUserStatuses(data);
    } catch (error) {
        console.error("🚀 ~ getUsersStatus ~ Msgdetails error:", error);
    }
}


// متغیرات کو محفوظ کرنے کے لیے ایک آبجیکٹ
const state = {
    userStatuses: {},
    activeUserIds: [],
    previousReceiverId: null
};

function updateUserStatuses(statuses) {
    state.userStatuses = statuses;
    checkUserStatus();
    updateStatusUI(); // 👈 Add this line
}

function updateStatusUI() {
    const statusElem = document.getElementById('user-status-text');
    const userId = selectedUser?.id; // ✅ Make sure selectedUser is accessible here
    const status = state.userStatuses[userId];

    if (statusElem && status) {
        statusElem.textContent = status === 'online' ? 'Online' : 'Offline';
        statusElem.classList.remove('online', 'offline');
        statusElem.classList.add(status); // Adds 'online' or 'offline' class
    }
}

function checkUserStatus() {
    if (!window.agent || !state.userStatuses) return;

    const isReceiverOnline = state.userStatuses[window.agent] === 'online';

    if (isReceiverOnline && !state.activeUserIds.includes(window.agent)) {
        state.activeUserIds.push(window.agent);
    } else {
        state.activeUserIds = state.activeUserIds.filter(id => id !== window.agent);
    }

    if (state.previousReceiverId && state.previousReceiverId !== window.agent) {
        state.activeUserIds = state.activeUserIds.filter(id => id !== state.previousReceiverId);
    }

    state.previousReceiverId = window.agent;

    console.log("Active User IDs:", state.activeUserIds);
}

// وقفے وقفے سے اسٹیٹس کو چیک کرنا (اختیاری)
setInterval(getUsersStatus, 5000);

// start chat scroller func
function scrollToBottom() {
    const conversationMessages = document.querySelector(".conversation-messages");
    if (conversationMessages) {
        conversationMessages.scrollTop = conversationMessages.scrollHeight;
    }
}
// start chat scroller func

async function SaveHistory(callType, callStatus) {
    const token = localStorage.getItem('access_token');
    const callerId = localStorage.getItem('userId');
    const agent = selectedUser?.id; // receiver

    if (!selectedUser || !selectedUser.id) {
        console.error("❌ selectedUser or selectedUser.id is missing");
        return;
    }

    showCustomAlert(`${selectedUser.username} is not active now`);
    console.log("check selecteduserid", agent)

    try {
        const response = await fetch('https://enigmakey.tech/serv/save-call-history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                caller_id: callerId,
                receiver_id: agent,
                call_time: new Date(),
                call_type: callType,
                call_status: callStatus,
                read_status: false,
                duration: ''
            })
        });

        const data = await response.json();
        console.log("Server Response:", data);

    } catch (error) {
        console.error("🚀 ~ SaveHistory ~ error:", error);
    }
}

//   SaveHistory('video', 'missedcall');

function UserSession() {
    const agent = selectedUser?.id; // receiver

    fetch(`https://enigmakey.tech/serv/session-status/${agent}`)
        .then(response => response.json())
        .then(data => {
            const status = data?.status;
            console.log("User session status:", status);

            // Yahan aap status ko global variable me save kar sakte ho agar zarurat ho
            userSessionStatus = status;
        })
        .catch(error => {
            console.error("🚀 ~ UserSession ~ error:", error);
        });
}

function handleVideoCall() {
    console.log("video call");

    if (userSessionStatus === 'logged_in') {
        window.location.href =
            'desktopCall?id=' + selectedUser.id +
            '&firstName=' + selectedUser.firstName +
            '&lastName=' + selectedUser.lastName +
            '&callType=video' +
            '&callerDeviceType=' + callerDeviceType +
            '&receiverDeviceType=' + receiverDeviceType +
            '&profileImage=' + selectedUser.profileImage;
    } else {
        SaveHistory('video', 'missedcall');
    }
}

function handleAudioCall() {
    console.log("audio call");

    if (userSessionStatus === 'logged_in') {
        window.location.href =
            'desktopCall?id=' + selectedUser.id +
            '&firstName=' + selectedUser.firstName +
            '&lastName=' + selectedUser.lastName +
            '&callType=audio' +
            '&callerDeviceType=' + callerDeviceType +
            '&receiverDeviceType=' + receiverDeviceType +
            '&profileImage=' + selectedUser.profileImage;
    } else {
        SaveHistory('audio', 'missedcall');
    }
}


// 🔊 Global audio manager
const AudioManager = {
    currentSurfer: null,
    currentButton: null,

    stopAll() {
        if (this.currentSurfer && this.currentSurfer.isPlaying()) {
            this.currentSurfer.pause();
            if (this.currentButton) {
                this.currentButton.innerHTML = '<i class="ri-play-circle-line"></i>';
            }
            this.currentSurfer = null;
            this.currentButton = null;
        }
    },

    setCurrent(surfer, button) {
        this.stopAll();
        this.currentSurfer = surfer;
        this.currentButton = button;
    },

    clearCurrentIfMatch(surfer) {
        if (this.currentSurfer === surfer) {
            this.currentSurfer = null;
            this.currentButton = null;
        }
    }
};


// start chat messages func
const conversationContainer = document.getElementById("conversation-container");

function renderConversation(groupedMessages) {
    conversationContainer.innerHTML = ""; // Clear previous content

    document.cookie = "selectedUser=" + encodeURIComponent(JSON.stringify(selectedUser)) + "; path=/";
    console.log('selectUser', selectedUser)

    UserSession();

    let conversationHTML = `
        <div class="conversation-top">
         
         <!--   <button type="button" class="conversation-back">
                <img src="../static/chatimg/Backward arrow sign.png" alt="">
            </button> -->
             
            <div class="conversation-user">
                <img class="conversation-user-image" src="${selectedUser?.profileImage ? selectedUser?.profileImage : '../static/chatimg/bydefaultimg.png'}" alt=""/>
                <div>
                    <div class="conversation-user-name">${selectedUser?.username}</div>
                    <div class="conversation-user-status" id="user-status-text">Offline</div>

                </div>
            </div>
            <div class="conversation-buttons">
<button onclick="handleVideoCall()" class="audio-call-btnn">
  <i class="ri-vidicon-line"></i>
</button>

<button onclick="handleAudioCall()" class="audio-call-btnn">
  <i class="ri-phone-fill"></i>
</button>



    <button type="button" class="notification-btn" onclick="window.location.href='notification'">
        <i class="ri-notification-3-line"></i>
    </button>

     <button type="button" class="notification-btn" onclick="window.location.href='/images'">
    <i class="ri-image-line"></i>

</button> 
  <!-- <button type="button" class="notification-btn" onclick="sendUserData()">
    <i class="ri-more-2-line"></i> 
</button> -->
</div>
        </div>

      <div class="conversation-messages">`;

    // ✅ Conditionally show "See More" only if messages exist
    if (Object.keys(groupedMessages).length > 0) {
        conversationHTML += `
        <button id="see-more-btn" class="see-more-messages" onclick="seeMoreButtonHandler()">See More</button>
    `;
    }

    conversationHTML += `
    <ul class="conversation-list">
`;


    conversationHTML += `
   <div id="audioCallModall" class="modal" style="display: none;">
    <div class="modal-content">
        <span class="close-btn">&times;</span>
        <div class="profile">
            <img src="../static/chatimg/audiocall.png" alt="Caller">
        </div>
        <p class="caller-name">Gunther Berg</p>
        <p class="call-timer">01:54</p>
        <div class="call-actions">
            <button class="video-btn"><img src="../static/chatimg/Video call.png" alt=""></button>
            <button class="call-btn"><img src="../static/chatimg/Calls (1).png" alt=""></button>
            <button class="mute-btn"><img src="../static/chatimg/Voice copy 2.png" alt=""></button>
        </div>
    </div>
</div>
`;

    //     conversationHTML += `
    // <div id="audioCallModal" class="modal" style="display: none;">
    //     <div class="modal-content">
    //         <span class="close-btn">&times;</span>
    //         <div class="profile">
    //             <img src="../static/chatimg/audiocall.png" alt="Caller">
    //         </div>
    //         <p class="caller-name">Gunther Berg</p>
    //         <p class="call-timer">01:44</p>
    //         <div class="call-actions">
    //             <button class="video-btn"><img src="../static/chatimg/Video call.png" alt=""></button>
    //             <button class="call-btn"><img src="../static/chatimg/Calls (1).png" alt=""></button>
    //             <button class="mute-btn"><img src="../static/chatimg/Voice copy 2.png" alt=""></button>
    //         </div>
    //     </div>
    // </div>
    // `;

    // ✅ Show "No messages yet" if conversation is empty
    if (!Object.keys(groupedMessages).length) {
        conversationHTML += `
                <div class="no-messages">
                    <p>No messages yet!</p>
                </div>`;
        conversationContainer.innerHTML = conversationHTML;
    }

    Object.keys(groupedMessages).forEach(date => {
        let uniqueMessages = [];
        let messageIds = new Set(); // ✅ Prevent duplicate messages

        let dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }); // ✅ Message ke din ka name

        // 🛠️ Date ko bhi show karein WhatsApp-style
        conversationHTML += `
            <div class="message-date">${dayName}</div>  
        `;

        // groupedMessages[date].forEach(message => {
        //     // let dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
        //     // console.log("day:", dayName); // ✅ Sirf Day show hoga

        //     if (!messageIds.has(message.messageId)) {
        //         messageIds.add(message.messageId);
        //         uniqueMessages.push(message);

        //     }
        // });







        //ye lines add ki h voice k error k liye start

        let messagesForDate = groupedMessages[date];

        // ✅ Agar ek single message object hai, usay array me convert karo
        if (!Array.isArray(messagesForDate)) {
            messagesForDate = [messagesForDate];
            groupedMessages[date] = messagesForDate; // ✅ optional: update original for consistency
        }

        messagesForDate.forEach(message => {
            if (!messageIds.has(message.messageId)) {
                messageIds.add(message.messageId);
                uniqueMessages.push(message);
            }
        });

        //ye lines add ki h voice k error k liye end


        // 🛠️ Render only unique messages
        uniqueMessages.forEach(message => {
            console.log(message.type)
            if (message.type == "text") {
                conversationHTML += `
                <li class="conversation-item ${message.senderName === currentUser?.username ? "me" : "receiver"}" data-message-text="${message.text}" data-message-id="${message.messageId}" data-message-type="${message.type}">
                    <div class="conversation-item-content">
        ${message.senderName !== currentUser?.username ?
                        `<img class="conversation-user-image" src="${selectedUser?.profileImage ? selectedUser?.profileImage : '../static/chatimg/bydefaultimg.png'}" alt="User Image"/>`
                        : ""
                    }
         <div class="conversation-item-text" onclick="toggleOptions(event)">
                            ${message.forward ? `<div class="forwarded-label">Forwarded</div>` : ""}
                            ${message.text}
                        </div>
<div class="options-container" style="margin-left: -37px;
    display: none;
    margin-bottom: -74px; z-index: 1;"> <!-- Initially hidden -->
    <!--<button class="forward-btn" onclick="forwardMessage(event)">Forward</button>-->
   <button class="forward-btn" data-bs-toggle="modal" data-bs-target="#myModal" onclick="forwardMessage(event)">
    <img src="../static/chatimg/sharing.png" alt="Forward" class="forward-icon">
</button>


    <button class="delete-btn" onclick="deleteMessage(event)" data-message-id="${message.messageId}">
    <img src="../static/chatimg/Delete (1).png" alt="Delete" class="delete-icon">
</button>

 <!-- ✅ New Open Button Added Here -->
                       <button class="open-btn" onclick="openFile(event)" data-message-uri="${message.uri}" data-message-type="${message.type}">
                        <img src="../static/chatimg/Lock (2).png" alt="Open" class="open-icon">
                       </button>

</div>
        ${message.senderName === currentUser?.username ?
                        `<img class="conversation-user-image" src="${currentUser?.profileImage ? currentUser?.profileImage : '../static/chatimg/bydefaultimg.png'}" alt="User Image"/>`
                        : ""
                    }
    </div>
                </li>
            `;
            }

            if (message.type == "file") {
                let filePreview = "";

                // Extract file extension
                let fileExtension = message.uri.split('.').pop().toLowerCase();

                // Image Preview
                if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension)) {
                    filePreview = `<img src="${message.uri}" alt="Image" class="file-preview-image"/>`;
                }
                // Video Preview
                else if (["mp4", "webm", "ogg"].includes(fileExtension)) {
                    filePreview = `
            <video class="file-preview-video" controls>
                <source src="${message.uri}" type="video/${fileExtension}">
                Your browser does not support the video tag.
            </video>`;
                }
                // Audio Preview
                else if (["mp3", "wav", "ogg"].includes(fileExtension)) {
                    const audioId = `audio-${message.messageId}`;
                    const isSender = message.senderName === currentUser?.username;
                    const bgColor = isSender ? "#b70b0b" : "#343637";
                    const waveColor = isSender ? "#ffffff" : "#ffffff";
                    const progressColor = "red";

                    filePreview = `
                        <div class="audio-message" id="${audioId}" style="background:${bgColor}; color: ${isSender ? "white" : "black"};">
                            <button class="audio-play-button">
                                <i class="ri-play-circle-line"></i>
                            </button>
                            <div class="waveform"></div>
                            <span class="audio-duration">0:00</span>
                        </div>
                    `;

                    setTimeout(() => {
                        const audioElement = document.getElementById(audioId);
                        if (!audioElement) return;

                        const playButton = audioElement.querySelector(".audio-play-button");
                        const waveformContainer = audioElement.querySelector(".waveform");
                        const durationElement = audioElement.querySelector(".audio-duration");

                        const wavesurfer = WaveSurfer.create({
                            container: waveformContainer,
                            waveColor,
                            progressColor,
                            barWidth: 2,
                            barHeight: 1,
                            barGap: 1,
                            responsive: true,
                            height: 50,
                        });

                        wavesurfer.load(message.uri);

                        playButton.addEventListener("click", (e) => {
                            e.stopPropagation();

    

                            if (wavesurfer.isPlaying()) {
                                wavesurfer.pause();
                                playButton.innerHTML = '<i class="ri-play-circle-line"></i>';
                                 AudioManager.clearCurrentIfMatch(wavesurfer);
                            } else {
                                AudioManager.setCurrent(wavesurfer, playButton);
                                wavesurfer.play();
                                playButton.innerHTML = '<i class="ri-pause-circle-line"></i>';
                            }
                        });

                        wavesurfer.on('ready', () => {
                            const duration = Math.floor(wavesurfer.getDuration());
                            durationElement.textContent = `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, "0")}`;
                        });

                        // 👇 Live seconds update
                        wavesurfer.on('audioprocess', () => {
                            if (wavesurfer.isPlaying()) {
                                const currentTime = Math.floor(wavesurfer.getCurrentTime());
                                durationElement.textContent = `${Math.floor(currentTime / 60)}:${(currentTime % 60).toString().padStart(2, "0")}`;
                            }
                        });

                        wavesurfer.on('finish', () => {
                            playButton.innerHTML = '<i class="ri-play-circle-line"></i>';
                            AudioManager.clearCurrentIfMatch(wavesurfer);
                        });
                    }, 100);
                }


                // Document Preview (PDF, DOCX, TXT, etc.)
                else if (["pdf"].includes(fileExtension)) {
                    const isSender = message.senderName === currentUser?.username;
                    const bgColor = isSender ? "#b70b0b" : "#343637";  // red for sender, black for receiver

                    // File icon path
                    const fileIconPath = "../static/images/Documents new Icon.png";
                    filePreview = `
                    <div class="file-preview-document" style="background-color: ${bgColor}; color: white;">
                          <img src="${fileIconPath}" alt="File" class="file-icon">
    <span class="file-name">${message.name}</span>
                   </div>`;
                }
                else {
                    const isSender = message.senderName === currentUser?.username;
                    const bgColor = isSender ? "#b70b0b" : "#343637";  // red for sender, black for receiver

                    // File icon path
                    const fileIconPath = "../static/images/Documents new Icon.png";
                    // Default file icon with download option
                    //         filePreview = `
                    // <a href="${message.uri}" target="_blank" class="file-preview-default">
                    //     <img src="../static/chatimg/file-icon.png" alt="File">
                    //     <span>Download File</span>
                    // </a>`;
                    filePreview = `
            <div class="file-preview-document" style="background-color: ${bgColor}; color: white;">
                   <img src="${fileIconPath}" alt="File" class="file-icon">
    <span class="file-name">${message.name}</span>
           </div>`;
                }

                conversationHTML += `
                <li class="conversation-item ${message.senderName === currentUser?.username ? "me" : "receiver"}" data-message-id="${message.messageId}" data-message-text="${message.text}" data-message-type="${message.type}" data-message-name="${message.name}" data-message-uri="${message.uri}">
                    <div class="conversation-item-content">
                        ${message.senderName !== currentUser?.username ?
                        `<img class="conversation-user-image" src="${selectedUser?.profileImage || '../static/chatimg/bydefaultimg.png'}" alt="User Image"/>`
                        : ""
                    }
                        <div class="conversation-item-file" onclick="toggleOptions(event)">
                         ${message.forward ? `<div class="forwarded-label">Forwarded</div>` : ""}
                            ${filePreview}
                        </div>
        
                                    <div class="options-container" style="margin-left: -37px; display: none; margin-bottom: -74px; z-index: 1;">
                        <button class="forward-btn" data-bs-toggle="modal" data-bs-target="#myModal" onclick="forwardMessage(event)" data-message-text="${message.text}">
                            <img src="../static/chatimg/sharing.png" alt="Forward" class="forward-icon">
                        </button>
        
                        <button class="delete-btn" onclick="deleteMessage(event)" data-message-id="${message.messageId}">
                            <img src="../static/chatimg/Delete (1).png" alt="Delete" class="delete-icon">
                        </button>

                        <!-- ✅ New Open Button Added Here -->
                       <button class="open-btn" onclick="openFile(event)" data-message-uri="${message.uri}" data-message-type="${message.type}">
                        <img src="../static/chatimg/Lock (2).png" alt="Open" class="open-icon">
                       </button>
                    </div>
                    
                        ${message.senderName === currentUser?.username ?
                        `<img class="conversation-user-image" src="${currentUser?.profileImage || '../static/chatimg/bydefaultimg.png'}" alt="User Image"/>`
                        : ""
                    }
                    </div>
                </li>
            `;
            }


        });
    });

    // ✅ Global variable to store input value
    let textMessage = "";

    // ✅ Input event listener for dynamically created textarea
    document.addEventListener("input", (event) => {
        if (event.target && event.target.classList.contains("conversation-form-input")) {
            textMessage = event.target.value; // 🔥 Store value globally
            // console.log("User is typing:", textMessage);
        }
    });

    // ✅ Click event listener for dynamically created send button
    // ✅ Click event listener for send button (only targeting `.conversation-form-submit`)
    document.addEventListener("click", (event) => {
        const sendBtn = event.target.closest(".conversation-form-submit"); // 🎯 Target only `.conversation-form-submit`
        if (!sendBtn) return;

        console.log("📤 Send button clicked!"); // Debugging

        const textarea = document.querySelector(".conversation-form-input");
        if (!textarea || textarea.value.trim() === "") {
            console.warn("⚠️ Message is empty, not sending!");
            return;
        }

        sendPrivateMessage(textarea.value); // 🔥 Send latest message
        clearMessageInput(); // ✅ Clear input after sending
    });

    document.addEventListener("keydown", (event) => {
        const textarea = document.querySelector(".conversation-form-input");

        // Check if Enter is pressed, and no Shift key (Shift+Enter = new line)
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault(); // 🚫 Prevent new line

            const sendBtn = document.querySelector(".conversation-form-submit");
            if (!textarea || textarea.value.trim() === "") {
                console.warn("⚠️ Message is empty, not sending!");
                return;
            }

            // Trigger the same logic as click
            sendPrivateMessage(textarea.value);
            clearMessageInput();
        }
    });


    // ✅ Function to clear textarea after sending message
    function clearMessageInput() {
        const textarea = document.querySelector(".conversation-form-input");
        if (textarea) {
            textarea.value = "";
            textMessage = ""; // Reset global variable
            console.log("🧹 Cleared input field!");
        }
    }

    // ✅ Debugging: Ensure send button exists in DOM
    setTimeout(() => {
        const sendBtn = document.querySelector(".conversation-form-submit");
        if (!sendBtn) {
            console.error("❌ Send button NOT found in DOM!");
        } else {
            console.log("✅ Send button found in DOM.");
        }
    }, 500);


    conversationHTML += `
    </ul>
</div>

<div class="conversation-form">
    <input type="file" id="fileInput" class="hidden-file-input" multiple>

    <button type="button" class="conversation-form-button attachment-btn">
        <i class="ri-attachment-line"></i>
    </button>

    <textarea class="conversation-form-input" rows="1" placeholder="Type here..." id="textMsg"></textarea>
    <button type="submit" class="conversation-form-button conversation-form-submit send-btn">
        <i class="ri-send-plane-2-line"></i>
    </button>
    <button type="button" class="conversation-form-button conversation-form-submitt mic-btn">
        <i class="ri-mic-line"></i>
    </button>
</div>

<div id="filePreviewContainer" class="file-preview"></div>
`;

    // ✅ Append everything to `conversationContainer`
    conversationContainer.innerHTML = conversationHTML;

    document.getElementById("default-conversation").classList.remove("active");
    conversationContainer.classList.add("active");

    setupFileAttachment();

    // Re-bind event listeners for text area input
    const textarea = document.querySelector(".conversation-form-input");
    const sendBtn = document.querySelector(".send-btn");
    const micBtn = document.querySelector(".mic-btn");

    textarea.addEventListener("input", () => {
        if (textarea.value.trim().length > 0) {
            sendBtn.style.display = "inline-block";
            micBtn.style.display = "none";
        } else {
            sendBtn.style.display = "none";
            micBtn.style.display = "inline-block";
        }
    });

    sendBtn.style.display = "none"; // Hide send button initially
    micBtn.style.display = "inline-block"; // Show mic button initially

    let mediaRecorder;
    let audioChunks = [];

    micBtn.addEventListener("click", async () => {
        if (!mediaRecorder || mediaRecorder.state === "inactive") {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);

                audioChunks = []; // Reset chunks before recording

                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });

                    // Generate a unique filename
                    const uid = Date.now();
                    const fileName = `${uid}.mp3`;

                    // ✅ Create a File object from the Blob
                    const audioFile = new File([audioBlob], fileName, { type: "audio/mp3" });

                    console.log("🔹 File created for upload:", audioFile);

                    // Upload file using the same uploadFile function as file picker
                    const fileUrl = await uploadFile(audioFile);

                    if (fileUrl) {
                        console.log("✅ File uploaded successfully:", fileUrl);

                        // Send file URL via private message
                        sendPrivateFile(fileUrl, fileName);

                        // Render the audio message in chat
                        renderConversation([{ type: "file", uri: fileUrl, senderName: currentUser?.username }]);
                    } else {
                        console.error("❌ File upload failed!");
                        showCustomAlert("File upload failed! Check console for details.");
                    }

                    audioChunks = [];
                    micBtn.innerHTML = '<i class="ri-mic-line"></i>';
                };

                mediaRecorder.start();
                micBtn.innerHTML = '<i class="ri-stop-circle-line"></i>';
            } catch (error) {
                console.error("Microphone access denied:", error);
                showCustomAlert("Microphone permission required.");
            }
        } else {
            mediaRecorder.stop();
        }


    });



    setTimeout(() => {
        const audioCallBtn = document.querySelector(".audio-call-btn");
        const audioModal = document.getElementById("audioCallModal");
        const audioCloseBtn = document.querySelector("#audioCallModal .close-btn");

        if (audioCallBtn) {
            audioCallBtn.addEventListener("click", openAudioModal);
        }

        if (audioCloseBtn) {
            audioCloseBtn.addEventListener("click", closeAudioModal);
        }

        if (audioModal) {
            audioModal.addEventListener("click", function (event) {
                if (event.target === audioModal) closeAudioModal();
            });
        }
    }, 0);


    setTimeout(() => {
        const audioCallBtn = document.querySelector(".audio-call-btnn");
        const audioModal = document.getElementById("audioCallModall");
        const audioCloseBtn = document.querySelector("#audioCallModall .close-btn");

        if (audioCallBtn) {
            audioCallBtn.addEventListener("click", openAudioModal);
        }

        if (audioCloseBtn) {
            audioCloseBtn.addEventListener("click", closeAudioModal);
        }

        if (audioModal) {
            audioModal.addEventListener("click", function (event) {
                if (event.target === audioModal) closeAudioModal();
            });
        }
    }, 0);



    scrollToBottom();
}
// end chat messages func


// ✅ Function to Open Video Modal
function openVideoModal() {
    document.getElementById("videoCallModal").style.display = "flex";
}

// ✅ Function to Close Video Modal
function closeVideoModal() {
    document.getElementById("videoCallModal").style.display = "none";
}

// ✅ Function to Open Audio Modal
function openAudioModal() {
    document.getElementById("audioCallModal").style.display = "flex";
}

// ✅ Function to Close Audio Modal
function closeAudioModal() {
    document.getElementById("audioCallModal").style.display = "none";
}


document.addEventListener("DOMContentLoaded", function () {
    const moreInfoBtn = document.querySelector(".more-info-btn");
    const popupMenu = document.getElementById("popupMenu");

    moreInfoBtn.addEventListener("click", function (event) {
        popupMenu.style.display = popupMenu.style.display === "block" ? "none" : "block";
        event.stopPropagation();
    });

    document.addEventListener("click", function (event) {
        if (!moreInfoBtn.contains(event.target) && !popupMenu.contains(event.target)) {
            popupMenu.style.display = "none";
        }
    });
});


// Add event listeners for the buttons of chat start
function addButtonEventListeners() {
    // Video Call Button
    document.querySelector('.video-call-btn').addEventListener('click', function () {
        // Show the video call modal
        document.getElementById('videoCallModal').style.display = 'block';
    });

    // Get the video call modal and close button
    const videoCallModal = document.getElementById('videoCallModal');
    const videoCloseBtn = document.querySelector('.close-btn');

    // Close the video call modal when clicking on the close button
    videoCloseBtn.addEventListener('click', function () {
        videoCallModal.style.display = 'none';
    });

    // Close the video call modal if the user clicks outside of the modal
    window.addEventListener('click', function (e) {
        if (e.target === videoCallModal) {
            videoCallModal.style.display = 'none';
        }
    });

    // Audio Call Button
    document.querySelector('.audio-call-btn').addEventListener('click', function () {
        // Show the audio call modal
        document.getElementById('audioCallModal').style.display = 'block';
    });

    // Get the audio call modal and close button
    const audioCallModal = document.getElementById('audioCallModal');
    const audioCloseBtn = audioCallModal.querySelector('.close-btn');

    // Close the audio call modal when clicking on the close button
    audioCloseBtn.addEventListener('click', function () {
        audioCallModal.style.display = 'none';
    });

    // Close the audio call modal if the user clicks outside of the modal
    window.addEventListener('click', function (e) {
        if (e.target === audioCallModal) {
            audioCallModal.style.display = 'none';
        }
    });

    // Notifications Button
    document.querySelector('.notification-btn').addEventListener('click', function () {
        showCustomAlert('Opening notifications...');
        // Add your notifications functionality here
    });

    // More Info Button
    document.querySelector('.more-info-btn').addEventListener('click', function () {
        showCustomAlert('Opening more options...');
        // Add more info functionality here (like opening a settings menu)
    });
}
// Add event listeners for the buttons of chat end

// func of filter or search start
const searchInput = document.getElementById("searchInput");
const messageList = document.getElementById("messagesList");

function searchMessages() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const messageItems = document.querySelectorAll(".message-item");
    let found = false;

    messageItems.forEach(item => {
        const name = item.querySelector(".content-message-name").textContent.toLowerCase();
        const message = item.querySelector(".content-message-text").textContent.toLowerCase();

        if (name.includes(searchTerm) || message.includes(searchTerm)) {
            item.style.display = ""; // ✅ Show matching items
            found = true;
        } else {
            item.style.display = "none"; // ✅ Hide non-matching items
        }
    });

    let noDataMessage = document.querySelector(".no-data-message");

    if (!found) {
        messageList.classList.add("disabled-list"); // ✅ Disable messages container

        if (!noDataMessage) {
            noDataMessage = document.createElement("li");
            noDataMessage.classList.add("no-data-message");
            noDataMessage.innerText = "No data found!";
            messageList.appendChild(noDataMessage);
        }
    } else {
        messageList.classList.remove("disabled-list"); // ✅ Enable messages container again
        if (noDataMessage) {
            noDataMessage.remove();
        }
    }
}

searchInput.addEventListener("input", searchMessages);

// func of filter or search start


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

function activateButton(button, type) {
    const buttons = document.querySelectorAll('.action-button');
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // 🧠 Call correct UI
    renderMessages(type); // "chat" or "call"
}


// function activateButton(button, url) {
//     // Remove 'active' class from all buttons
//     const buttons = document.querySelectorAll('.action-button');
//     buttons.forEach(btn => btn.classList.remove('active'));

//     // Add 'active' class to the clicked button
//     button.classList.add('active');

    
//     // Check what the URL is and log accordingly
//     if (url.includes('chat')) {
//         console.log('chat');
//     } else if (url.includes('call')) {
//         console.log('call');
//     }
//     // Redirect to the respective URL
//     // window.location.href = url;
// }

// func of forward message to selected users start
// async function generateUserList() {
//     try {
//         const users = await getAllUsers(); // API call to fetch users

//         if (!users || users.length === 0) {
//             console.warn("No users found.");
//             return;
//         }

//         const userListContainer = document.getElementById('userList');
//         userListContainer.innerHTML = ""; // Clear existing list

//         users.forEach(user => {
//             const userDiv = document.createElement('div');
//             userDiv.classList.add('row', 'align-items-center', 'user-item');
//             userDiv.dataset.userId = user.id;
//             userDiv.dataset.username = user.username; // ✅ Store username in dataset

//             userDiv.innerHTML = `
//                 <div class="col-auto">
//                     <img src="${user.profile_image ? `https://enigmakey.tech/serv/files/${user?.profile_image}` : `../static/chatimg/bydefaultimg.png`}" alt="Image" class="img-fluid">
//                 </div>
//                 <div class="col">
//                     <p class="user-name">${user.username}</p>
//                 </div>
//                 <div class="col-auto">
//                     <button class="btnnn send-btn">Send</button>
//                 </div>
//             `;

//             // ✅ User div par click hone par console me naam show karo
//             userDiv.addEventListener('click', () => selectUser(userDiv));

//             // ✅ Send button ko sahi tarike se select karein
//             const sendButton = userDiv.querySelector('.send-btn');  // 🎯 Yeh line missing thi!

//             sendButton.addEventListener('click', (event) => {
//                 event.stopPropagation(); // Stop event bubbling

//                 const selectedUserId = user.id;
//                 const selectedMessageId = document.getElementById("selectedMessageId").textContent.split(": ")[1];

//                 if (!selectedMessageId) {
//                     console.error("❌ No message selected for forwarding!");
//                     return;
//                 }

//                 console.log(`📩 Forwarding message ${selectedMessageId} to user ${selectedUserId}`);

//                 forwardPrivateMessage(selectedMessageId, selectedUserId);
//             });

//             userListContainer.appendChild(userDiv);
//         });

//     } catch (error) {
//         console.error("Error generating user list:", error);
//     }
// }

async function generateUserList(globalMessageType, globalMessageText, globalMessageName, globalMessageUri) {
    try {
        const users = await getAllUsers(); // API call to fetch users
        if (!users || users.length === 0) return;

        const userListContainer = document.getElementById('userList');
        userListContainer.innerHTML = ""; // Clear existing list

        users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.classList.add('row', 'align-items-center', 'user-item');
            userDiv.dataset.userId = user.id;
            userDiv.dataset.username = user.username;

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

            const sendButton = userDiv.querySelector('.send-btn');
            sendButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Stop bubbling
                const selectedUserId = user.id;

                if (globalMessageType === "file") {
                    forwardPrivateFile(globalMessageUri, globalMessageName, selectedUserId);
                } else {
                    forwardPrivateMessage(globalMessageText, selectedUserId);
                }
            });

            userListContainer.appendChild(userDiv);
        });

    } catch (error) {
        console.error("Error generating user list:", error);
    }
}

// ✅ Jab kisi user ko select kare to console me naam print ho
function selectUser(userDiv) {
    // Deselect all users
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('selected');
    });

    // Select the clicked user
    userDiv.classList.add('selected');

    // ✅ Console me username show karo
    // ✅ Correct way to access user ID
    console.log("Selected user ID:", userDiv.dataset.userId);

}

// ✅ Alert function
function sendAlert(username) {
    showCustomAlert(`You clicked on ${username}`);
}

// ✅ Modal open hone par list generate karo
document.getElementById('myModal').addEventListener('shown.bs.modal', function () {
    const userListContainer = document.getElementById('userList');
    if (userListContainer.children.length === 0) { // Prevent duplicate users
        // generateUserList();
        generateUserList(globalMessageType, globalMessageText, globalMessageName, globalMessageUri);
    }
});

// ✅ Modal close hone par cleanup
document.addEventListener('hidden.bs.modal', function () {
    document.body.classList.remove('modal-open');
    document.body.style.overflow = ''; // Restore scrolling

    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.remove();
    });

    document.getElementById('userList').innerHTML = ''; // Clear users when closing modal
});

// func of forward message to selected users start

function openImageModal(src) {
    document.getElementById("modalImage").src = src;
    document.getElementById("imageModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("imageModal").style.display = "none";
}

function showCustomAlert(message) {
    document.getElementById('custom-alert-message').textContent = message;
    document.getElementById('custom-alert').style.display = 'flex';
}

function hideCustomAlert() {
    document.getElementById('custom-alert').style.display = 'none';
}

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

