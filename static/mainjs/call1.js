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
let callHistory = [];



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

// setTimeout(() => {
//     const textArea = document.querySelector(".conversation-form-input");
//     if (textArea) {
//         textArea.addEventListener("input", () => {
//             console.log("User is typing:", textArea.value);
//         });
//     } else {
//         console.error("❌ textArea not found!");
//     }
// }, 0);


// window.onload = function () {
//     const fetchMessages = async () => {
//         try {
//             await getMessages();
//         } catch (error) {
//             console.error("Error fetching messages:", error);
//         }

//         // Wait for 2 seconds, then call again
//         setTimeout(fetchMessages, 60000);
//     };

//     // Start polling on window load
//     fetchMessages();
// };


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

        if (data?.user) {
            currentUser = {
                ...data.user,
                profileImage: data.user.profile_image
                    ? `https://enigmakey.tech/serv/files/${data.user.profile_image}`
                    : `../static/chatimg/bydefaultimg.png`
            };

            userId = data.user.id;
            console.log("✅ Updated currentUser:", currentUser);

            localStorage.removeItem('currentUser');  
            localStorage.removeItem('userName');  

            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('userName', data.user.username); // ✅ Save new username

            // localStorage.setItem('currentUser', JSON.stringify(currentUser));

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
    console.log("🚀 ~ After async call, stored userName:", localStorage.getItem('userName')); // ✅ Debug log
    if (user) {
        console.log("🚀 ~ After async call, currentUser:", user);
        console.log("🚀 ~ After async call, userId:", user.id);
        getAllUsers();
    } else {
        console.log("❌ Failed to fetch user data.");
    }
});




// var socket = io('http://127.0.0.1:3000'); // Server ka address specify karein
// const io = require("socket.io-client");
// const axios = require("axios");
// const readline = require("readline");
// const fs = require("fs");

// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });

// const myUserId =  prompt('Welcome! Please enter your id:')
// if (!myUserId) {
//     promt("Enter your user ID as a command-line argument.");
//     process.exit(1);
// }


// ✅ **Socket Initialization Function**
const initializeSocket = () => {
    if (!currentUser) {
        console.error("Socket initialization failed: currentUser is null");
        return;
    }

    // Local server socket code
    // socket = io("http://192.168.100.208:5000/chat", {
    //     transports: ["websocket"],
    //     query: { senderId: currentUser.id },
    // });

    // AWS server socket code
    socket = io("https://enigmakey.tech/chat", {
        transports: ["websocket"],
        query: { senderId: currentUser.id },
    });

    socket.on("connect", () => {
        console.log("✅ Connection established with Socket.IO");
        socket.emit("register", { user_id: currentUser.id });
    });
    socket.on("new_private_message", (message) => {
        if (!message) {
            console.error("❌ Received an empty message!");
            return;
        }

        console.log("📩 New private message received:", message);

        const senderId = message.sender_id;
        const msgType = message.type;

        console.log(`📩 Type=${msgType}, From=${senderId}`);

        // ✅ Get updated messages from server

        getMessages();
        // simulateMessageProcessing();
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

const sendPrivateMessage = (textMsg) => {
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

        isMessageSent = true; // ✅ Mark as message sent
        // ✅ **Now setup the event listeners after sending the message**

        // getMessages();
        // simulateMessageProcessing();


    } catch (error) {
        console.error("❌ Error in sendPrivateMessage:", error);
    }
};


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
            data: `Forwarded\n${forwardMsg}`,
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

        // getMessages();
        // simulateMessageProcessing();


    } catch (error) {
        console.error("❌ Error in sendPrivateMessage:", error);
    }
};



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

        // getMessages();
        // simulateMessageProcessing();


    } catch (error) {
        console.error("❌ Error in sendPrivateMessage:", error);
    }
};

const forwardPrivateFile = (uri, fileName) => {
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


// if (!socket) {
//     console.error("❌ Socket is not initialized!");
//     return;
// }


// ✅ Ensure event listener is not attached multiple times
// socket.off("new_private_message"); // Remove previous listener



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

        console.log("📩 New private message received:", message);

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


// ✅ **Setup Message Listeners After Sending Message**
const setupMessageListeners = () => {
    if (!isMessageSent) return; // Ensure message was sent before setting up listeners

    // socket.on("new_private_message", (message) => {
    //     // Extract message details
    //     const recipientId = message.receiverId;
    //     const senderId = message.senderId;
    //     const msgType = message.type;

    //     console.log(`📩 New private message received: Type=${msgType}, From=${senderId}, To=${recipientId}`);

    //     // Perform any additional processing (e.g., update UI, notify users)
    //     socket.emit("private_message_received", { recipient_id: recipientId, sender_id: senderId });
    // });

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
document.querySelector('.chat-sidebar-profile-toggle').addEventListener('click', function (e) {
    e.preventDefault();
    this.parentElement.classList.toggle('active');
});

document.addEventListener('click', function (e) {
    if (!e.target.matches('.chat-sidebar-profile, .chat-sidebar-profile *')) {
        document.querySelector('.chat-sidebar-profile').classList.remove('active');
    }
});
// end: Sidebar






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


// const messages = [
//     {
//         id: 1,
//         name: "Abdullah",
//         image: "../static/chatimg/pic1.png",
//         send: [`What is Lorem Ipsum?
// Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.

// Why do we use it?
// It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).


// Where does it come from?`],
//         receive: [`What is Lorem Ipsum?
// Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.

// Why do we use it?
// It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).


// Where does it come from?`]
//     },
//     {
//         id: 2,
//         name: "Ahmed",
//         image: "../static/chatimg/pic2.png",
//         send: ["Hey, what's up?", "Do you need anything?"],
//         receive: ["All good, thanks!", "Not right now."]
//     },
//     {
//         id: 3,
//         name: "Sara",
//         image: "../static/chatimg/pic3.png",
//         send: ["Hi Sara!", "Are you coming to the meeting?"],
//         receive: ["Hi! Yes, I will be there."]
//     },
//     {
//         id: 4,
//         name: "Abd",
//         image: "../static/chatimg/pic4.png",
//         send: ["Hello, how are you?", "Are you available today?"],
//         receive: ["I'm fine, thank you!", "Yes, I am."]
//     },
//     {
//         id: 5,
//         name: "Abdullah",
//         image: "../static/chatimg/pic5.png",
//         send: ["Hello Abdullah, how are you"],
//         receive: ["I'm fine, thank you!"]
//     },
//     {
//         id: 2,
//         name: "Ahmed",
//         image: "../static/chatimg/pic1.png",
//         send: ["Hey, what's up?", "Do you need anything?"],
//         receive: ["All good, thanks!", "Not right now."]
//     },
//     {
//         id: 3,
//         name: "Sara",
//         image: "../static/chatimg/pic1.png",
//         send: ["Hi Sara!", "Are you coming to the meeting?"],
//         receive: ["Hi! Yes, I will be there."]
//     },
//     {
//         id: 4,
//         name: "Abd",
//         image: "../static/chatimg/pic1.png",
//         send: ["Hello, how are you?", "Are you available today?"],
//         receive: ["I'm fine, thank you!", "Yes, I am."]
//     },
//     {
//         id: 1,
//         name: "Abdullah",
//         image: "../static/chatimg/pic1.png",
//         send: ["Hello Abdullah, how are you"],
//         receive: ["I'm fine, thank you!"]
//     },
//     {
//         id: 2,
//         name: "Ahmed",
//         image: "../static/chatimg/pic1.png",
//         send: ["Hey, what's up?", "Do you need anything?"],
//         receive: ["All good, thanks!", "Not right now."]
//     },
//     {
//         id: 3,
//         name: "Sara",
//         image: "../static/chatimg/pic1.png",
//         send: ["Hi Sara!", "Are you coming to the meeting?"],
//         receive: ["Hi! Yes, I will be there."]
//     },
//     {
//         id: 4,
//         name: "Abd",
//         image: "../static/chatimg/pic1.png",
//         send: ["Hello, how are you?", "Are you available today?"],
//         receive: ["I'm fine, thank you!", "Yes, I am."]
//     }
// ]

// Get all users function

const API_BASE_URL = 'https://enigmakey.tech/serv';



const getAllUsers = async () => {
    const token = localStorage.getItem('access_token')
    try {
        // const token = localStorage.getItem('USER_TOKEN');
        // const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTczODkxMjg2NiwianRpIjoiNzczODc5YjItYTY0Yi00ODk2LThlNjktNTJkZjM0MDQ0ZDBlIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6eyJ1c2VyX2lkIjoiMWI4YjE3NDEtOGFkNy00NzE4LThlZTgtODQ2YThkMTY5NzI0IiwidXNlcm5hbWUiOiJBaHNhbiIsInJvbGUiOiJVc2VyIn0sIm5iZiI6MTczODkxMjg2NiwiY3NyZiI6IjM1NTNmZDdhLWRiNjYtNGIyYS1hOTU5LTY4ZmE5YjcyMTQ0NSIsImV4cCI6MTczODkxMzc2Nn0.Z9clBRYKLdEtYvf1ovZWDIhoD-t4iv807dBPei1nqOU';
        // const userId = localStorage.getItem('userId');
        // const userId = '1b8b1741-8ad7-4718-8ee8-846a8d169724';
        // const userName = localStorage.getItem('userName');
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


const container = document.getElementById("image-container");
const networkHeading = document.getElementById("network-count"); // Heading ko access karna
async function renderUserImages() {
    container.innerHTML = ""; // Clear previous images

    try {
        const users = await getAllUsers(); // Fetch all users
        const currentUser = await getCurrentUserData(); // Fetch logged-in user

        console.log("Fetched Users for Images:", users);

        // Logged-in user ko hatao
        const filteredUsers = users.filter(user => user.id !== currentUser?.id);

        // 🛠️ Fix: Ab network count correctly show hoga
        networkHeading.textContent = `My Network: ${filteredUsers.length}`;

        if (filteredUsers.length > 0) {
            filteredUsers
                .slice(0, 10) // Limit to 10 users
                .forEach((user, index) => {
                    const imageWrapper = document.createElement("div");
                    imageWrapper.classList.add("network-image-wrapper");

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



const getMessages = async () => {
    console.log('calling get messages...')
    renderMessages();
    try {
        //const response = await fetch(`${API_BASE_URL}/get_messages`);
        console.log("currentUser", currentUser?.username)
        console.log("selectedUser", selectedUser?.username)
        const response = await fetch(`${API_BASE_URL}/get_messages?name1=${currentUser.username}&name2=${selectedUser.username}&page=${1}&page_size=${currentPage}`);
        // const response = await fetch(`${API_BASE_URL}/get_messages?name1=${currentUser?.username}&name2=${selectedUser?.username}&page=1&page_size=20`);
        //http://enigmakey.tech/serv/get_messages?name1=Ahsan&name2=Farooq&page=3&page_size=5

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("getmessages", data);
        serverMessages = data.messages;
        localStorage.setItem('messages', JSON.stringify(serverMessages));

        console.log("🚀 ~ getMessages ~ serverMessages:", serverMessages)

        serverMessages.push(...data.messages);

        simulateMessageProcessing();
    } catch (error) {
        console.error("🚀 ~ getMessages ~ error:", error);
    }
};

const getLastMessages = async (cuser, hitUser) => {
    try {
        //const response = await fetch(`${API_BASE_URL}/get_messages`);
        const response = await fetch(`${API_BASE_URL}/get_messages?name1=${currentUser?.username}&name2=${hitUser}&page=1&page_size=1`);
        //http://enigmakey.tech/serv/get_messages?name1=Ahsan&name2=Farooq&page=3&page_size=5

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
// ✅ Archive a user
async function archiveUser(userId) {
    try {
        const token = await getSessionToken();
        if (!token) {
            alert("Authorization token is missing. Please log in again.");
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
            setTimeout(async () => {
                await window.location.reload(); // 🔄 Refresh active users
                //wait renderArchivedUsers(); // 🔄 Refresh archived users
            }, 2000); // Adjust delay time (500ms = 0.5s)
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error("Error archiving user:", error);
    }
}


async function starUser(userId) {
    try {
        const token = await getSessionToken();
        if (!token) {
            alert("Authorization token is missing. Please log in again.");
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
            console.log("User successfully archived!");
            setTimeout(async () => {
                await renderMessages(); // 🔄 Refresh active users
                //wait renderArchivedUsers(); // 🔄 Refresh archived users
            }, 2000); // Adjust delay time (500ms = 0.5s)
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error("Error archiving user:", error);
    }
}


// ✅ Remove a user from archive
async function removeFromArchive(userId) {
    try {
        const token = await getSessionToken();
        if (!token) {
            alert("Authorization token is missing. Please log in again.");
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
            setTimeout(async () => {
                //await renderMessages(); // 🔄 Refresh active users
                await renderArchivedUsers(); // 🔄 Refresh archived users
            }, 2000); // Adjust delay time (500ms = 0.5s)
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error("Error removing user from archive:", error);
    }
}

async function removeFromStar(userId) {
    try {
        const token = await getSessionToken();
        if (!token) {
            alert("Authorization token is missing. Please log in again.");
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
            setTimeout(async () => {
                //await renderMessages(); // 🔄 Refresh active users
                await renderMessages(); // 🔄 Refresh archived users
            }, 2000); // Adjust delay time (500ms = 0.5s)
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error("Error removing user from archive:", error);
    }
}

async function removeFromStarAndRenderStared(userId) {
    try {
        const token = await getSessionToken();
        if (!token) {
            alert("Authorization token is missing. Please log in again.");
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
            setTimeout(async () => {
                //await renderMessages(); // 🔄 Refresh active users
                await renderStaredUsers(); // 🔄 Refresh archived users
            }, 2000); // Adjust delay time (500ms = 0.5s)
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error("Error removing user from archive:", error);
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

async function renderMessages(searchQuery = "") {
    try {
        
        const [users, callHistory] = await Promise.all([getAllUsers(), getCallHistory()]);

        messagesList.innerHTML = ""; // ✅ Puri list clear karein

        if (!Array.isArray(callHistory) || callHistory.length === 0) {
            messagesList.innerHTML = `<li class="no-data-message">No call history found!</li>`;
            return;
        }

        console.log("Fetched Users:", users);
        console.log("Fetched Call History:", callHistory);

        const currentUserData = localStorage.getItem("currentUser");
        const loggedInUser = currentUserData ? JSON.parse(currentUserData) : null;
        const loggedInUsername = loggedInUser?.username || "";

        console.log("✅ Logged-in Username:", loggedInUsername);
        const usersMap = new Map();
        users.forEach(user => usersMap.set(user.username, user));

        let filteredCalls = callHistory.filter(call => {
            const caller = usersMap.get(call.caller?.username);
            const callerName = caller?.username || call.caller?.username || "";

            if (callerName === loggedInUsername) {
                console.log("Skipping call from logged-in user:", callerName);
                return false;
            }

            return searchQuery ? callerName.toLowerCase().includes(searchQuery.toLowerCase()) : true;
        });

        if (filteredCalls.length === 0) {
            messagesList.innerHTML = `<li class="no-data-message">No data found!</li>`;
            return;
        }

        for (const call of filteredCalls) {
            const caller = usersMap.get(call.caller?.username);
            const userId = caller?.id || "unknown";
        
            const callerName = caller?.username || call.caller?.username || "Unknown Caller";
            const callDate = new Date(call.call_time);
            const formattedTime = timeAgo(callDate); // ✅ "5 min ago" format
        
            const profileImage = caller?.profile_image
                ? `https://enigmakey.tech/serv/files/${caller.profile_image}`
                : `../static/chatimg/bydefaultimg.png`;
        
            // ✅ Call type ke basis pe image select karein
            const callImage = call.call_type === "video" 
                ? `<img src="../static/chatimg/Video call.png" alt="Video Call" class="call-icon" style="cursor: pointer;">`
                : `<img src="../static/chatimg/Calls.png" alt="Audio Call" class="call-icon" style="cursor: pointer;">`;
        
            const listItem = document.createElement("li");
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
                    <div class="message-images">
                        ${callImage}  <!-- ✅ Ye dynamically change hoga -->
                    </div>
                </a>
            `;
        
            messagesList.appendChild(listItem);
        }
        
    } catch (error) {
        console.error("❌ Error fetching data:", error);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await getSessionData(); // ✅ Ensure session data is updated
    await getCurrentUserData(); // ✅ Fetch current user
    await renderMessages(); // ✅ Update call history UI
});




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


messagesList.addEventListener("click", (e) => {
    e.preventDefault();
    const target = e.target.closest("a");
    if (!target) return;

    const id = target.getAttribute("data-id");
    console.log("userID checking",id)
    // console.log("🚀 ~ Selected User ID:", id);

    if (id === selectedUser?.id) return; // ✅ If same user, do nothing

    getAllUsers().then(users => {
        const user = users.find(u => u.id === id);
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

            // ✅ Process Messages Immediately for the new user
            getMessages();
            processMessages();
            simulateMessageProcessing()
            renderConversation(groupedMessages);
        }
    });
});


const seeMoreButtonHandler = () => {
    console.log("see more")
    currentPage += 2;  // Increment the current page
    console.log(currentPage);
    setTimeout(() => {
        getMessages();
    }, 500);
    // getMessages();
};

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



    // Get the parent container of the message
    const conversationItem = event.currentTarget.closest(".conversation-item");
    const optionsContainer = conversationItem.querySelector(".options-container");
    // const messageTextt = conversationItem.querySelector(".conversation-item-text").textContent;
    const messageText = conversationItem.getAttribute("data-message-text");
    const messageId = conversationItem.getAttribute("data-message-id");

    // Store message text inside the buttons for forward and delete
    const forwardBtn = optionsContainer.querySelector(".forward-btn");
    const deleteBtn = optionsContainer.querySelector(".delete-btn");

    // Pass messageId to the buttons
    forwardBtn.setAttribute("data-message-text", messageText);
    deleteBtn.setAttribute("data-message-id", messageId);

    // Show the options (forward and delete buttons) for the current message
    optionsContainer.style.display = "block"; // Show buttons

    // Hide all other options containers
    document.querySelectorAll(".options-container").forEach(container => {
        if (container !== optionsContainer) {
            container.style.display = "none"; // Hide other options containers
        }
    });
}

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

// Handle Forward and Delete Button Actions
// Handle Forward and Delete Button Actions
function forwardMessage(event) {
    // ✅ Clicked button se message ID lo
    const messageText = event.target.getAttribute("data-message-text");

    if (messageText) {
        // ✅ Modal me ID show karo
        document.getElementById("selectedMessageId").textContent = "Message ID: " + messageText;
        console.log("Forwarding message with ID:", messageText);
    } else {
        console.log("Message ID not found!");
    }
}


// function deleteMessage(event) {
//     const messageId = event.target.getAttribute("data-message-id");
//     console.log("Deleting message with ID:", messageId);
//     // Handle deleting the message based on its ID here
// }

function deleteMessage(event) {
    const messageId = event.target.getAttribute("data-message-id");

    if (!messageId) {
        console.error("Error: Message ID not found!");
        return;
    }

    console.log("Deleting message with ID:", messageId);

    // API call to delete message
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
            // 🛠️ Optionally remove the message from the UI
            event.target.closest(".conversation-item").remove();
        })
        .catch(error => {
            console.error("Error deleting message:", error);
        });
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
// متغیرات کو محفوظ کرنے کے لیے ایک آبجیکٹ
const state = {
    userStatuses: {},
    activeUserIds: [],
    previousReceiverId: null
};

function updateUserStatuses(statuses) {
    state.userStatuses = statuses;
    checkUserStatus();
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

function scrollToBottom() {
    const conversationMessages = document.querySelector(".conversation-messages");
    if (conversationMessages) {
        conversationMessages.scrollTop = conversationMessages.scrollHeight;
    }
}




const conversationContainer = document.getElementById("conversation-container");

function renderConversation(groupedMessages) {
    conversationContainer.innerHTML = ""; // Clear previous content


    let conversationHTML = `
        <div class="conversation-top">
         <a href="home">
            <button type="button" class="conversation-back">
                <img src="../static/chatimg/Backward arrow sign.png" alt="">
            </button>
             </a>
            <div class="conversation-user">
                <img class="conversation-user-image" src="${selectedUser?.profileImage ? selectedUser?.profileImage : '../static/chatimg/bydefaultimg.png'}" alt=""/>
                <div>
                    <div class="conversation-user-name">${selectedUser?.username}</div>
                    <div class="conversation-user-status ${state.userStatuses[selectedUser?.id] === 'online' ? 'online' : 'offline'}">
    ${state.userStatuses[selectedUser?.id] === 'online' ? 'Online' : 'Offline'}
</div>

                </div>
            </div>
            <div class="conversation-buttons">
    <button type="button" class="audio-call-btnn">
        <i class="ri-vidicon-line"></i>
    </button>


    <button type="button" class="audio-call-btn">
        <i class="ri-phone-fill"></i>
    </button>


    <button type="button" class="notification-btn" onclick="window.location.href='notification'">
        <i class="ri-notification-3-line"></i>
    </button>

    <!-- <button type="button" class="notification-btn" onclick="window.location.href='/images'">
    <i class="ri-more-2-line"></i>
</button> -->
<button type="button" class="notification-btn" onclick="sendUserData()">
    <i class="ri-more-2-line"></i>
</button>
</div>
        </div>

        <div class="conversation-messages">
          <button id="see-more-btn" class="see-more-messages" onclick="seeMoreButtonHandler()">See More</button>
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
        <p class="call-timer">01:44</p>
        <div class="call-actions">
            <button class="video-btn"><img src="../static/chatimg/Video call.png" alt=""></button>
            <button class="call-btn"><img src="../static/chatimg/Calls (1).png" alt=""></button>
            <button class="mute-btn"><img src="../static/chatimg/Voice copy 2.png" alt=""></button>
        </div>
    </div>
</div>
`;

    conversationHTML += `
<div id="audioCallModal" class="modal" style="display: none;">
    <div class="modal-content">
        <span class="close-btn">&times;</span>
        <div class="profile">
            <img src="../static/chatimg/audiocall.png" alt="Caller">
        </div>
        <p class="caller-name">Gunther Berg</p>
        <p class="call-timer">01:44</p>
        <div class="call-actions">
            <button class="video-btn"><img src="../static/chatimg/Video call.png" alt=""></button>
            <button class="call-btn"><img src="../static/chatimg/Calls (1).png" alt=""></button>
            <button class="mute-btn"><img src="../static/chatimg/Voice copy 2.png" alt=""></button>
        </div>
    </div>
</div>
`;

    Object.keys(groupedMessages).forEach(date => {
        let uniqueMessages = [];
        let messageIds = new Set(); // ✅ Prevent duplicate messages

        let dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }); // ✅ Message ke din ka name

        // 🛠️ Date ko bhi show karein WhatsApp-style
        conversationHTML += `
            <div class="message-date">${dayName}</div>  
        `;

        groupedMessages[date].forEach(message => {
            // let dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
            // console.log("day:", dayName); // ✅ Sirf Day show hoga
        
            if (!messageIds.has(message.messageId)) {
                messageIds.add(message.messageId);
                uniqueMessages.push(message);
                
            }
        });
        
        
        
        // 🛠️ Render only unique messages
        uniqueMessages.forEach(message => {
            console.log(message.type)
            if (message.type == "text") {
                conversationHTML += `
                <li class="conversation-item ${message.senderName === currentUser?.username ? "me" : "receiver"}" data-message-text="${message.text}" data-message-id="${message.messageId}">
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
    margin-bottom: -74px;"> <!-- Initially hidden -->
    <!--<button class="forward-btn" onclick="forwardMessage(event)">Forward</button>-->
   <button class="forward-btn" data-bs-toggle="modal" data-bs-target="#myModal" onclick="forwardMessage(event)">
    <img src="../static/chatimg/sharing.png" alt="Forward" class="forward-icon">
</button>


    <button class="delete-btn" onclick="deleteMessage(event)">
    <img src="../static/chatimg/Delete (1).png" alt="Delete" class="delete-icon">
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
            //     if (message.type=="file"){
            //         conversationHTML += `
            //             <li class="conversation-item ${message.senderName === currentUser?.username ? "me" : "receiver"}">
            //                 <div class="conversation-item-content">
            //     ${message.senderName !== currentUser?.username ? 
            //         `<img class="conversation-user-image" src="${selectedUser?.profileImage ? selectedUser?.profileImage : '../static/chatimg/bydefaultimg.png'}" alt="User Image"/>` 
            //         : ""
            //     }
            //     <div class="conversation-item-text">${message.uri}</div>
            //     ${message.senderName === currentUser?.username ? 
            //         `<img class="conversation-user-image" src="${currentUser?.profileImage ? currentUser?.profileImage : '../static/chatimg/bydefaultimg.png'}" alt="User Image"/>` 
            //         : ""
            //     }
            // </div>
            //             </li>
            //         `;
            // }


            if (message.type == "file") {
                let filePreview = "";

                // Extract file extension
                let fileExtension = message.uri.split('.').pop().toLowerCase();

                // Image Preview
                if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension)) {
                    filePreview = `<img src="${message.uri}" alt="Image" class="file-preview-image" onclick="window.open('${message.uri}', '_blank')" />`;
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
                    filePreview = `
            <div class="audio-message">
                <button class="audio-play-button">
                    <i class="ri-play-circle-line"></i>
                </button>
                <div class="waveform"></div>
                <span class="audio-duration">0:00</span>
            </div>
        `;

                    // Use setTimeout to ensure elements are available in DOM
                    setTimeout(() => {
                        const playButton = document.querySelector(".audio-play-button");
                        const waveformContainer = document.querySelector(".waveform");
                        const durationElement = document.querySelector(".audio-duration");

                        if (!playButton || !waveformContainer || !durationElement) {
                            console.error("⚠️ Audio elements not found!");
                            return;
                        }

                        // Initialize Wavesurfer
                        const wavesurfer = WaveSurfer.create({
                            container: waveformContainer,
                            waveColor: '#ffffff',
                            progressColor: '#000000',
                            barWidth: 2,
                            barHeight: 1,
                            barGap: 1,
                            responsive: true,
                            height: 50,
                        });

                        wavesurfer.load(message.uri);

                        // Handle Play/Pause
                        playButton.addEventListener("click", () => {
                            if (wavesurfer.isPlaying()) {
                                wavesurfer.pause();
                                playButton.innerHTML = '<i class="ri-play-circle-line"></i>';
                            } else {
                                wavesurfer.play();
                                playButton.innerHTML = '<i class="ri-pause-circle-line"></i>';
                            }
                        });

                        // Update Duration when ready
                        wavesurfer.on('ready', () => {
                            const duration = Math.floor(wavesurfer.getDuration());
                            durationElement.textContent = `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, "0")}`;
                        });

                    }, 100); // Small delay to ensure elements are available
                }

                // Document Preview (PDF, DOCX, TXT, etc.)
                else if (["pdf"].includes(fileExtension)) {
                    filePreview = `
            <iframe src="${message.uri}" class="file-preview-document"></iframe>`;
                }
                else {
                    // Default file icon with download option
                    filePreview = `
            <a href="${message.uri}" target="_blank" class="file-preview-default">
                <img src="../static/chatimg/file-icon.png" alt="File">
                <span>Download File</span>
            </a>`;
                }

                conversationHTML += `
        <li class="conversation-item ${message.senderName === currentUser?.username ? "me" : "receiver"}">
            <div class="conversation-item-content">
                ${message.senderName !== currentUser?.username ?
                        `<img class="conversation-user-image" src="${selectedUser?.profileImage || '../static/chatimg/bydefaultimg.png'}" alt="User Image"/>`
                        : ""
                    }
                <div class="conversation-item-text">
                    ${filePreview}
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

    // // ✅ Function to send message
    // function sendPrivateMessage(message) {
    //     console.log("📩 Sending Message:", message); // Debugging line

    //     // const msg = {
    //     //     type: "text",
    //     //     data: message,
    //     //     recipient_id: selectedUser?.id,
    //     //     sender_id: currentUser?.id,
    //     // };

    //     // socket.emit("private_message", msg); // 🔥 Send message to socket
    // }

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
                        alert("File upload failed! Check console for details.");
                    }

                    audioChunks = [];
                    micBtn.innerHTML = '<i class="ri-mic-line"></i>';
                };

                mediaRecorder.start();
                micBtn.innerHTML = '<i class="ri-stop-circle-line"></i>';
            } catch (error) {
                console.error("Microphone access denied:", error);
                alert("Microphone permission required.");
            }
        } else {
            mediaRecorder.stop();
        }
    });

    // setTimeout(() => {
    //     document.querySelector(".video-call-btn").addEventListener("click", openVideoModal);
    //     document.querySelector("#videoCallModal .close-btn").addEventListener("click", closeVideoModal);
    //     document.getElementById("videoCallModal").addEventListener("click", function (event) {
    //         if (event.target === this) closeVideoModal();
    //     });
    // }, 0);


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





function openVideoModal() {
    document.getElementById("videoCallModal").style.display = "flex";
}

// ✅ Function to Close Modal
function closeVideoModal() {
    document.getElementById("videoCallModal").style.display = "none";
}

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


// Add event listeners for the buttons
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
        alert('Opening notifications...');
        // Add your notifications functionality here
    });

    // More Info Button
    document.querySelector('.more-info-btn').addEventListener('click', function () {
        alert('Opening more options...');
        // Add more info functionality here (like opening a settings menu)
    });
}

const searchInput = document.getElementById("searchInput"); // Search bar reference

// ✅ Search Messages
function searchMessages() {
    console.log("Running search...");
    const searchTerm = searchInput.value.trim().toLowerCase(); // Get and normalize search term
    const messageItems = document.querySelectorAll(".message-item"); // Get all message list items

    messageItems.forEach(item => {
        const name = item.querySelector(".content-message-name").textContent.toLowerCase();
        const message = item.querySelector(".content-message-text").textContent.toLowerCase();
        
        // ✅ Check if search term is present in name or message
        if (name.includes(searchTerm) || message.includes(searchTerm)) {
            item.style.display = ""; // Show matching items
        } else {
            item.style.display = "none"; // Hide non-matching items
        }
    });
}

// ✅ Attach event listener to search bar
searchInput.addEventListener("input", (e) => {
    renderMessages(e.target.value); // ✅ Call with search query
});


// // Filter messages by search query
// const searchInput = document.getElementById("searchInput");
// searchInput.addEventListener("input", () => {
//     const query = searchInput.value.toLowerCase();
//     const filteredMessages = messages.filter((msg) => msg.name.toLowerCase().includes(query));
//     console.log("I am here");
//     renderMessages(filteredMessages);  // Re-render messages based on the filter
// });


// Show logout popup
document.getElementById('logoutBtn').addEventListener('click', function () {
    document.getElementById('logoutPopup').style.display = 'flex';  // Show popup
});

// Close logout popup
function closeLogoutPopup() {
    document.getElementById('logoutPopup').style.display = 'none';  // Close popup
}

// Logout action
function logout() {
    console.log("🔴 Logging out, clearing localStorage...");
    
    localStorage.removeItem("access_token");
    localStorage.removeItem("userName");   // ✅ Remove username
    localStorage.removeItem("currentUser"); // ✅ Remove currentUser data
    localStorage.removeItem("userId");

    alert('You have been logged out.');
    window.location.href = "/signin";

    setTimeout(() => {
        location.reload(true);
    }, 100);
}




// const chatContainer = document.querySelector(".conversation-list");

// function scrollToBottom() {
//     chatContainer.scrollTop = chatContainer.scrollHeight;
// }

// // Call this function every time a new message is added
// scrollToBottom();
function activateButton(button, url) {
    // Remove 'active' class from all buttons
    const buttons = document.querySelectorAll('.action-button');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Add 'active' class to the clicked button
    button.classList.add('active');

    // Redirect to the respective URL
    window.location.href = url;
}
async function generateUserList() {
    try {
        const users = await getAllUsers(); // API call to fetch users

        if (!users || users.length === 0) {
            console.warn("No users found.");
            return;
        }

        const userListContainer = document.getElementById('userList');
        userListContainer.innerHTML = ""; // Clear existing list

        users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.classList.add('row', 'align-items-center', 'user-item');
            userDiv.dataset.userId = user.id;
            userDiv.dataset.username = user.username; // ✅ Store username in dataset

            userDiv.innerHTML = `
                <div class="col-auto">
                    <img src="${user.profile_image ? `https://enigmakey.tech/serv/files/${user?.profile_image}` : `../static/chatimg/bydefaultimg.png`}" alt="Image" class="img-fluid">
                </div>
                <div class="col">
                    <p class="user-name">${user.username}</p>
                </div>
                <div class="col-auto">
                    <button class="btnnn send-btn">Send</button>
                </div>
            `;

            // ✅ User div par click hone par console me naam show karo
            userDiv.addEventListener('click', () => selectUser(userDiv));

            // ✅ Send button ko sahi tarike se select karein
            const sendButton = userDiv.querySelector('.send-btn');  // 🎯 Yeh line missing thi!

            sendButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Stop event bubbling

                const selectedUserId = user.id;
                const selectedMessageId = document.getElementById("selectedMessageId").textContent.split(": ")[1];

                if (!selectedMessageId) {
                    console.error("❌ No message selected for forwarding!");
                    return;
                }

                console.log(`📩 Forwarding message ${selectedMessageId} to user ${selectedUserId}`);

                forwardPrivateMessage(selectedMessageId, selectedUserId);
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
    alert(`You clicked on ${username}`);
}

// ✅ Modal open hone par list generate karo
document.getElementById('myModal').addEventListener('shown.bs.modal', function () {
    const userListContainer = document.getElementById('userList');
    if (userListContainer.children.length === 0) { // Prevent duplicate users
        generateUserList();
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


