let receiverSocketNumber = null;

const callerId = Math.floor(100000 + Math.random() * 900000).toString();
const webrtcSocket = io("http://enigmakey.tech:3500", { transports: ['websocket'], query: { callerId } });

webrtcSocket.on("connect", () => {
  console.log('Socket connected', webrtcSocket)
  });

let localStream = null, remoteStream = null, pc = null;

const configuration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

const startLocalStream = async () => {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        console.log("✅ Local stream initialized successfully:", localStream);
        
        // if (localStream) {
        //     document.getElementById("local-video").srcObject = localStream;
        // }
    } catch (error) {
        console.error("❌ Error getting local stream:", error);
        // alert("Camera/Microphone access is required for video call.");
    }
};


const getQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
        id: params.get('id'),
        firstName: params.get('firstName'),
        lastName: params.get('lastName'),
        callType: params.get('callType'),
    };
};

// (async () => {
//     await startLocalStream();
//     console.log("🚀 Local stream after initialization:", localStream);
// })();


const selectedUser = getQueryParams();

document.addEventListener("DOMContentLoaded", function () {
    if (selectedUser) {
        document.getElementById('selectedUserName').innerHTML = `${selectedUser.firstName} ${selectedUser.lastName}`;
        document.getElementById('callingType').innerHTML = `Enigma ${selectedUser.callType} Call...`;
    } 
});

const GetCallerId = async () => {
    try {
        const response = await fetch(`https://enigmakey.tech/serv/get-call-id/${selectedUser.id}`);
        const data = await response.json();
        receiverSocketNumber = data?.call_id;
        if (receiverSocketNumber) {
            createPeerConnection();
            setTimeout(() => { sendPing(); }, 1000);
        }
    } catch (error) {
        console.error("🚀 ~ GetCallerId ~ error:", error);
    }
};

GetCallerId();

async function createPeerConnection() { 
    if (!localStream) {
        // console.error("❌ Local stream is not initialized. Retrying...");
        console.log("🚀 ~ webrtcSocket:", webrtcSocket)
        await startLocalStream(); // دوبارہ کوشش کریں
        if (!localStream) {
            alert("Failed to access camera/microphone. Please check permissions.");
            return;
        }
    }

    pc = new RTCPeerConnection(configuration);

    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    pc.ontrack = (event) => {
        if (!remoteStream) {
            remoteStream = new MediaStream();
            document.getElementById("remote-video").srcObject = remoteStream;
        }
        remoteStream.addTrack(event.track);
    };

    pc.onicecandidate = (event) => {
        if (event.candidate) {
            console.log("📡 Sending ICE candidate:", event.candidate);

            webrtcSocket.emit("ICEcandidate", {
                calleeId: receiverSocketNumber,
                rtcMessage: event.candidate
            });
        }
    };

    try {
        const offer = await pc.createOffer();
        if (offer) {
            await pc.setLocalDescription(offer);

            webrtcSocket.emit("call", {
                calleeId: receiverSocketNumber,
                rtcMessage: offer,
            });

            console.log("📞 Offer sent to", receiverSocketNumber);
            sendPing();
        }
    } catch (err) {
        console.error("❌ Error creating offer:", err);
    }
}

const sendPing = async () => {
    const activeUserData = localStorage.getItem('currentUser');
    const LoginUserData = JSON.parse(activeUserData);
    if (webrtcSocket && receiverSocketNumber && LoginUserData) {
        webrtcSocket.emit('sendPing', {
            recipientId: receiverSocketNumber, 
            callerName: `${LoginUserData?.first_name} ${LoginUserData?.last_name}`, 
            callerAvatar: LoginUserData?.profile_image_url || '',
            userId: LoginUserData.id, 
            callType: selectedUser?.callType 
        });
    } else {
        console.error('Error', 'Recipient ID is required to send a ping.')
    }
};



document.addEventListener("DOMContentLoaded", () => {
    const declineBtn = document.querySelector('.btn.decline'); // ✅ Sahi selector use karein

    if (declineBtn) {  // ✅ Null check taake error na aaye
        declineBtn.addEventListener('click', () => {
            window.location.href = 'chat'; // ✅ Redirect to chat.html
        });
    } else {
        console.error("Error: '.btn.decline' button not found!");
    }
});

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