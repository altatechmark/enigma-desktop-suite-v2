var audiocalltype = true;
var videocalltype = true;
let receiverSocketNumber = null;
let LoginUserData = null;
let receiverDeviceType = '';
let callerDeviceType = '';
let pendingCallData = null; // Store call data temporarily

// Define the original URL including all parameters

// Step 1: Get the full URL
// const fullURL = window.location.href;

// // Step 2: Create a URL object
// const url = new URL(fullURL);
// console.log('url =======>>>', url.href)

// const lockedURL = 'http://localhost:5000/desktopCall?id=090ea230-91ee-41f8-b242-677ca9bc227b&firstName=Abdullah&lastName=Shah&callType=video&callerDeviceType=desktop&receiverDeviceType=mobile';

// // Function to enforce locked URL
// function enforceLockedURL() {
//     const currentURL = window.location.href;

//     if (currentURL !== lockedURL) {
//         // Redirect back to original URL
//         window.location.href = lockedURL;
//     }
// }

// // Run the function on load
// enforceLockedURL();

// // Also enforce it when user tries to go back or navigate
// window.addEventListener('popstate', enforceLockedURL);
// window.addEventListener('hashchange', enforceLockedURL);

// // Optionally, keep checking every few seconds (strong lock)
// setInterval(enforceLockedURL, 1000);



// let allUsers = [];


// const API_BASE_URL = 'https://enigmakey.tech/serv';



const callerId = Math.floor(100000 + Math.random() * 900000).toString();;
const webrtcSocket = io("http://enigmakey.tech:3500", { transports: ['websocket'], query: { callerId } });
// const WebRTCSocket = io("http://192.168.18.10:3500", { transports: ['websocket'], query: { callerId } });

let localStream, remoteStream, pc, targetPeerId;
const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

const endcall = () => {
    console.log("endcall")
    sendReversePing("decline");

    // localStorage.setItem("goToHome", "true"); // ✅ Flag set karo
    window.history.back();
    setTimeout(() => {
        window.location.reload();
    }, 500);

};

navigator.mediaDevices.enumerateDevices()
    .then(devices => {
        // Check if there's any video or audio device
        const hasVideoDevice = devices.some(device => device.kind === 'videoinput');
        const hasAudioDevice = devices.some(device => device.kind === 'audioinput');

        if (!hasVideoDevice || !hasAudioDevice) {
            // Show alert if no video or audio device is found
            alert('No video or audio device found. Please connect a device and try again.');
        } else {
            // Proceed with getting media stream if devices are available
            navigator.mediaDevices.getUserMedia({ video: videocalltype, audio: audiocalltype })
                .then(stream => {
                    localStream = stream;
                    // By default, mute the microphone
                    let audioTrack = localStream.getAudioTracks()[0];
                    if (audioTrack) {
                        audioTrack.enabled = false; // Set mic to OFF by default
                    }

                    console.log('Microphone is initially muted:', !audioTrack.enabled);
                    document.getElementById('local-video').srcObject = stream;
                })
                .catch(err => {
                    console.error('Failed to get local stream:', err);
                });
        }
    })
    .catch(err => {
        console.error('Error enumerating devices:', err);
    });



// const sendPing = async () => {
//   let recipientId = '388395'
//   const userId = '7af346b6-b614-426b-a808-5acf499a9e7c'; // Fetch the active user's ID
//   if (socket && recipientId && userId) {
//     socket.emit('sendPing', { recipientId, callerName: 'usaid', callerAvatar: '', userId: userId, callType: 'video' });
//     // Alert.alert('Ping Sent', `Ping sent to ${recipientId}`);
//   } else {
//     // Alert.alert('Error', 'Recipient ID is required to send a ping.');
//     console.log('Error', 'Recipient ID is required to send a ping.')
//   }
// };

// filhal comment kia h homeScreen
function homeScreen() {
    document.getElementById('outgoing-call').style.display = 'none';
    document.getElementById('video-call').style.display = 'none';
    document.getElementById('recieved').style.display = 'none';
    document.getElementById('audio-call').style.display = 'none';

    document.getElementById('homecreen').style.display = 'block';

};

// Today's code

const getQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    console.log("🚀 ~ getQueryParams ~ params:", params)
    return {
        id: params.get('id'),
        firstName: params.get('firstName'),
        lastName: params.get('lastName'),
        callType: params.get('callType'),
        receiverDeviceType: params.get('receiverDeviceType'),
        callerDeviceType: params.get('callerDeviceType'),
        profileImage: params.get('profileImage'),
    };
};




const sendPing = async () => {
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

const GetCallerIdForDesktop = async () => {
    const activeUserData = localStorage.getItem('currentUser');
    LoginUserData = JSON.parse(activeUserData);
    try {
        const response = await fetch(`https://enigmakey.tech/serv/get-call-id/${selectedUser.id}`);
        const data = await response.json();
        receiverSocketNumber = data?.call_id;
        if (receiverSocketNumber) {
            targetPeerId = receiverSocketNumber
            showOutgoingCallScreen(targetPeerId);
            await createPeerConnection();
            // Create an offer
            pc.createOffer()
                .then(offer => pc.setLocalDescription(offer))
                .then(() => {
                    // Send the offer (as rtcMessage) to the callee via the signaling server.
                    webrtcSocket.emit('call', {
                        calleeId: targetPeerId,
                        rtcMessage: { sdp: pc.localDescription }
                    });
                    console.log('Offer sent to', targetPeerId);
                    let recipientId = targetPeerId
                    const userId = '7af346b6-b614-426b-a808-5acf499a9e7c'; // Fetch the active user's ID
                    if (webrtcSocket && recipientId && userId) {
                        sendPing();
                        // Alert.alert('Ping Sent', `Ping sent to ${recipientId}`);
                    }
                })
                .catch(err => console.error('Error creating offer:', err));

        }
    } catch (error) {
        console.error("🚀 ~ GetCallerId ~ error:", error);
    }
};


const GetCallerIdForMobile = async () => {
    const activeUserData = localStorage.getItem('currentUser');
    LoginUserData = JSON.parse(activeUserData);
    try {
        const response = await fetch(`https://enigmakey.tech/serv/get-call-id/${selectedUser.id}`);
        const data = await response.json();
        receiverSocketNumber = data?.call_id;
        if (receiverSocketNumber) {
            targetPeerId = receiverSocketNumber
            showOutgoingCallScreen(targetPeerId);
            await createPeerConnection();
            // Create an offer
            pc.createOffer()
                .then(offer => pc.setLocalDescription(offer))
                .then(() => {
                    // Send the offer (as rtcMessage) to the callee via the signaling server.
                    webrtcSocket.emit('call', {
                        calleeId: targetPeerId,
                        rtcMessage: { sdp: pc.localDescription }
                    });
                    console.log('Offer sent to', targetPeerId);
                    let recipientId = targetPeerId
                    const userId = '7af346b6-b614-426b-a808-5acf499a9e7c'; // Fetch the active user's ID
                    if (webrtcSocket && recipientId && userId) {
                        sendPing();
                        // Alert.alert('Ping Sent', `Ping sent to ${recipientId}`);
                    }
                })
                .catch(err => console.error('Error creating offer:', err));

        }

        setTimeout(async () => {
                targetPeerId = receiverSocketNumber
                showOutgoingCallScreen(targetPeerId);
                await createPeerConnection();
                // Create an offer
                pc.createOffer()
                    .then(offer => pc.setLocalDescription(offer))
                    .then(() => {
                        // Send the offer (as rtcMessage) to the callee via the signaling server.
                        webrtcSocket.emit('call', {
                            calleeId: targetPeerId,
                            rtcMessage: { sdp: pc.localDescription }
                        });
                        console.log('Offer sent to', targetPeerId);
                        let recipientId = targetPeerId
                        const userId = '7af346b6-b614-426b-a808-5acf499a9e7c'; // Fetch the active user's ID
                        if (webrtcSocket && recipientId && userId) {
                            sendPing();
                            // Alert.alert('Ping Sent', `Ping sent to ${recipientId}`);
                        }
                    })
                    .catch(err => console.error('Error creating offer:', err));
    

        }, 1000);
    } catch (error) {
        console.error("🚀 ~ GetCallerId ~ error:", error);
    }
};


const selectedUser = getQueryParams();
console.log("🚀 ~ selectedUser from params:", selectedUser);

if (selectedUser.receiverDeviceType === 'mobile') {
    console.log('Receiver is Loged in on mobile!');
    GetCallerIdForMobile();
} else {
    console.log('Both users are Loged in on desktop!');
    GetCallerIdForDesktop();
}



if (selectedUser.callType === 'audio') {
    console.log('videocalltype = false')
    videocalltype = false
} else {
    videocalltype = true
    console.log('videocalltype = true')
}

document.addEventListener("DOMContentLoaded", function () {
    if (selectedUser) {
        document.getElementById('selectedUserName').innerHTML = `${selectedUser.firstName} ${selectedUser.lastName}`;
        document.getElementById('receiverCallerName').innerHTML = `${selectedUser.firstName} ${selectedUser.lastName}`;
        document.getElementById('audioCallReceiverCallerName').innerHTML = `${selectedUser.firstName} ${selectedUser.lastName}`;
        document.getElementById('delineCallUserName').innerHTML = `${selectedUser.firstName} ${selectedUser.lastName}`;
        document.getElementById('callingType').innerHTML = `Enigma ${selectedUser.callType} Call...`;
        document.getElementById('audioCallCallingType').innerHTML = `Enigma ${selectedUser.callType} Call...`;
        document.getElementById('declinecallingType').innerHTML = `Decline ${selectedUser.callType} Call...`;
        document.getElementById('AvatarForDeclineCall').src = selectedUser.profileImage ? `${selectedUser.profileImage}` : '../static/images/pic4.png';
        document.getElementById('AvatarForOutgoingCall').src = selectedUser.profileImage ? `${selectedUser.profileImage}` : '../static/images/pic4.png';
        document.getElementById('AvatarForAudioCall').src = selectedUser.profileImage ? `${selectedUser.profileImage}` : '../static/images/pic4.png';
        // document.getElementById('AvatarForAudioCall2').src = selectedUser.profileImage ? `${selectedUser.profileImage}` : '../static/images/pic4.png';
            // Set caller name and call type dynamically
    }
});

// Today's code

// When connected, display our own callerId.
webrtcSocket.on('connect', () => {
    // document.getElementById('my-id').textContent = callerId;
    if (callerId) {
        updateCallerId(callerId)
        console.log('Connected with callerId:', callerId, 'and socket id:', webrtcSocket.id);   
    }
});

// Get local media (video and audio)
// navigator.mediaDevices.getUserMedia({ video: videocalltype, audio: audiocalltype })
//   .then(stream => {
//     localStream = stream;
//      // By default, mute the microphone
//      let audioTrack = localStream.getAudioTracks()[0];
//      if (audioTrack) {
//        audioTrack.enabled = false; // Set mic to OFF by default
//      }

//      console.log('Microphone is initially muted:', !audioTrack.enabled);
//     document.getElementById('local-video').srcObject = stream;
//   })
//   .catch(err => {
//     console.error('Failed to get local stream:', err);
//   });




// Function to create a new RTCPeerConnection and add local tracks.
async function createPeerConnection() {

    if (!localStream) {
        // console.error("❌ Local stream is not initialized. Retrying...");
        // console.log("🚀 ~ webrtcSocket:", webrtcSocket)
       await startLocalStream(); // Try again
        if (!localStream) {
            alert("Failed to access camera/microphone. Please check permissions.");
            return;
        }
    }

    pc = new RTCPeerConnection(configuration);

    // Add our local tracks to the connection.
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

    // When remote tracks arrive, display them.
    pc.ontrack = event => {
        if (!remoteStream) {
            remoteStream = new MediaStream();
            document.getElementById('remote-video').srcObject = remoteStream;
        }
        remoteStream.addTrack(event.track);
    };



    // When an ICE candidate is found, send it to the other peer.
    pc.onicecandidate = event => {
        if (event.candidate) {
            console.log('Sending ICE candidate:', event.candidate);
            webrtcSocket.emit('ICEcandidate', {
                calleeId: targetPeerId,
                rtcMessage: { candidate: event.candidate }
            });
        }
    };
};

const startLocalStream = async () => {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: videocalltype, audio: true });
        console.log("✅ Local stream initialized successfully:", localStream);
        let audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = false; // Set mic to OFF by default
        };
    } catch (error) {
        console.error("❌ Error getting local stream:", error);
        // alert("Camera/Microphone access is required for video call.");
    }
};

// const getAllUsers = async () => {
//     try {
//         const token = 'access_token';
//         // const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTczODkxMjg2NiwianRpIjoiNzczODc5YjItYTY0Yi00ODk2LThlNjktNTJkZjM0MDQ0ZDBlIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6eyJ1c2VyX2lkIjoiMWI4YjE3NDEtOGFkNy00NzE4LThlZTgtODQ2YThkMTY5NzI0IiwidXNlcm5hbWUiOiJBaHNhbiIsInJvbGUiOiJVc2VyIn0sIm5iZiI6MTczODkxMjg2NiwiY3NyZiI6IjM1NTNmZDdhLWRiNjYtNGIyYS1hOTU5LTY4ZmE5YjcyMTQ0NSIsImV4cCI6MTczODkxMzc2Nn0.Z9clBRYKLdEtYvf1ovZWDIhoD-t4iv807dBPei1nqOU';
//         const userId = localStorage.getItem('userId');
//         //   const userId = '1b8b1741-8ad7-4718-8ee8-846a8d169724';
//         // const userName = localStorage.getItem('userName');
//         const userName = 'Ahsan';


//         const response = await fetch(`${API_BASE_URL}/get-all-users`, {
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${token}`,
//                 'Content-Type': 'application/json',
//             },
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }

//         const data = await response.json();
//         console.log("🚀 ~ getAllUsers ~ data:", data.users)
//         allUsers.push(...data.users)

//         const filteredUsers = data?.users?.filter(
//             user => user.id !== userId
//         );

//         // const otherUserData = data?.users?.filter(
//         //     user => user.id === '7af346b6-b614-426b-a808-5acf499a9e7c'
//         // );
//         // console.log("🚀 ~ getAllUsers ~ usaidData:", otherUserData[0].call_id)
//         // && user.username !== 'Admin'

//         return filteredUsers;
//     } catch (error) {
//         console.error('getAllUsers error', error);
//     }
// };

// const renderUsersToUI = (users) => {
//     const container = document.getElementById('users-container');
//     container.innerHTML = ''; // clear previous data

//     users.forEach(user => {
//         const userDiv = document.createElement('div');
//         userDiv.textContent = user.username || 'No Name';
//         userDiv.style.cursor = 'pointer';
//         userDiv.style.padding = '8px';
//         userDiv.style.border = '1px solid #ccc';
//         userDiv.style.margin = '5px 0';

//         userDiv.addEventListener('click', () => {
//             console.log('Clicked User Data:', user);
//             document.getElementById('peer-id-input').value = user.call_id
//         });

//         container.appendChild(userDiv);
//     });
// };

// const init = async () => {
//     const users = await getAllUsers();
//     // if (users) {
//     //     renderUsersToUI(users);
//     // }
// };

// init();


// Update caller ID in the backend
const updateCallerId = async (callerId) => {
    // const userId = '1b8b1741-8ad7-4718-8ee8-846a8d169724';
    const userId = localStorage.getItem('userId');
    try {
        const response = await fetch(`https://enigmakey.tech/serv/update-call-id/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }, // Added headers
            body: JSON.stringify({ call_id: callerId }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // Parse response
        console.log("🚀 ~ updateCallerId ~ response:", data.updated_fields.call_id);
    } catch (error) {
        console.error('Error updating caller ID:', error);
    }
};




window.onload = function () {
    const shouldGoHome = localStorage.getItem("goToHome");

    if (shouldGoHome === "true") {
        localStorage.removeItem("goToHome"); // ✅ Flag hata do
        homeScreen(); // ✅ Show home screen
    }
};




const videoCallContainer = document.getElementById('video-call');
const minimizeBtn = document.querySelectorAll('.window-controls span')[0];
const maximizeBtn = document.querySelectorAll('.window-controls span')[1];
const closeBtn = document.querySelectorAll('.window-controls span')[2];

minimizeBtn.addEventListener('click', () => {
    videoCallContainer.style.width = '400px';
    videoCallContainer.style.height = '300px';
    videoCallContainer.style.opacity = '0.8';
    videoCallContainer.style.position = 'fixed';
    videoCallContainer.style.bottom = '10px';
    videoCallContainer.style.right = '10px';
    videoCallContainer.style.zIndex = '9999'; // Optional: bring it to front
});

maximizeBtn.addEventListener('click', () => {
    videoCallContainer.style.width = '100%';
    videoCallContainer.style.height = '100vh';
    videoCallContainer.style.opacity = '1';
    videoCallContainer.style.position = 'relative';
    videoCallContainer.style.bottom = '';
    videoCallContainer.style.right = '';
    videoCallContainer.style.zIndex = '';
});

closeBtn.addEventListener('click', () => {
    videoCallContainer.style.display = 'none'; // ✅ Hide video call UI
});



const draggable = document.getElementById('draggable');
let isDragging = false;
let offsetX, offsetY;

draggable.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - draggable.getBoundingClientRect().left;
    offsetY = e.clientY - draggable.getBoundingClientRect().top;
    draggable.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    let x = e.clientX - offsetX;
    let y = e.clientY - offsetY;

    draggable.style.left = `${x}px`;
    draggable.style.top = `${y}px`;
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    draggable.style.cursor = 'grab';
});



function showOutgoingCallScreen(targetPeerId) {
    // Hide all other screens
    document.getElementById('video-call').style.display = 'none';
    document.getElementById('recieved').style.display = 'none';
    document.getElementById('homecreen').style.display = 'none';

    // Show outgoing call screen
    document.getElementById('outgoing-call').style.display = 'block';


}


// Initiate a call when the call button is clicked.
// document.getElementById('call-btn').addEventListener('click', () => {
//   targetPeerId = document.getElementById('peer-id-input').value;
//   console.log("targetPeerId checking",targetPeerId)
//   if (!targetPeerId) {
//     return alert('Please enter a peer ID.');
//   }
//     // Call the function to show outgoing call screen
//     showOutgoingCallScreen(targetPeerId);
//   createPeerConnection();
//   // Create an offer
//   pc.createOffer()
//     .then(offer => pc.setLocalDescription(offer))
//     .then(() => {
//       // Send the offer (as rtcMessage) to the callee via the signaling server.
//       socket.emit('call', {
//         calleeId: targetPeerId,
//         rtcMessage: { sdp: pc.localDescription }
//       });
//       console.log('Offer sent to', targetPeerId);
//       let recipientId = targetPeerId
//       const userId = '7af346b6-b614-426b-a808-5acf499a9e7c'; // Fetch the active user's ID
//       if (socket && recipientId && userId) {
//         socket.emit('sendPing', { recipientId, callerName: 'usaid', callerAvatar: '/serv/files/1000059257.jpg', userId: userId, callType: 'video' });
//         // Alert.alert('Ping Sent', `Ping sent to ${recipientId}`);
//       }
//     })
//     .catch(err => console.error('Error creating offer:', err));

//     // setTimeout(() => {
//     //   showOutgoingCallScreen(targetPeerId);
//     //   createPeerConnection();
//     //   // Create an offer
//     //   pc.createOffer()
//     //     .then(offer => pc.setLocalDescription(offer))
//     //     .then(() => {
//     //       // Send the offer (as rtcMessage) to the callee via the signaling server.
//     //       socket.emit('call', {
//     //         calleeId: targetPeerId,
//     //         rtcMessage: { sdp: pc.localDescription }
//     //       });
//     //       console.log('Offer sent to', targetPeerId);
//     //       let recipientId = targetPeerId
//     //       const userId = '7af346b6-b614-426b-a808-5acf499a9e7c'; // Fetch the active user's ID
//     //       if (socket && recipientId && userId) {
//     //         socket.emit('sendPing', { recipientId, callerName: 'usaid', callerAvatar: '/serv/files/1000059257.jpg', userId: userId, callType: 'video' });
//     //         // Alert.alert('Ping Sent', `Ping sent to ${recipientId}`);
//     //       }
//     //     })
//     //     .catch(err => console.error('Error creating offer:', err));
//     // }, 1000);
// });




// When receiving an incoming call (offer)
webrtcSocket.on('newCall', data => {
    // data: { callerId, rtcMessage }
    const callerId = data.callerId;
    const rtcMessage = data.rtcMessage;
    console.log('Incoming call from', callerId);

    // Save the caller as our target and create a connection.
    if (!pc) {
        targetPeerId = callerId;
        createPeerConnection();
    };
    

    // Set the remote description to the received offer.
    pc.setRemoteDescription(new RTCSessionDescription(rtcMessage.sdp))
        .then(() => {
            // Create an answer.
            return pc.createAnswer();
        })
        .then(answer => pc.setLocalDescription(answer))
        .then(() => {
            // Send the answer back to the caller.
            webrtcSocket.emit('answerCall', {
                callerId: callerId,
                rtcMessage: { sdp: pc.localDescription }
            });
            console.log('Answer sent to', callerId);
        })
        .catch(err => console.error('Error handling incoming call:', err));
});

// When our call gets answered, set the remote description.
webrtcSocket.on('callAnswered', data => {
    console.log('Call answered by', data);
    const rtcMessage = data.rtcMessage;
    pc.setRemoteDescription(new RTCSessionDescription(rtcMessage.sdp))
        .catch(err => console.error('Error setting remote description:', err));
});

// Handle ICE candidates received from the other peer.
webrtcSocket.on('ICEcandidate', data => {
    const rtcMessage = data.rtcMessage;
    if (rtcMessage.candidate) {
        console.log('Received ICE candidate:', rtcMessage.candidate);
        pc.addIceCandidate(new RTCIceCandidate(rtcMessage.candidate))
            .catch(err => console.error('Error adding ICE candidate:', err));
    }
});


function sendReversePing(action) {
    console.log("sendReversePing", pendingCallData, receiverSocketNumber);
    let recipientId = pendingCallData ?  pendingCallData.senderId : receiverSocketNumber;
    webrtcSocket.emit('sendReversePing', { recipientId, action: action })
}


// Function to show received call screen and hide others
function showReceivedCallScreen() {
    document.getElementById('outgoing-call').style.display = 'none';
    document.getElementById('video-call').style.display = 'none';
    document.getElementById('homecreen').style.display = 'none';

    document.getElementById('recieved').style.display = 'block'; // Show received call UI
}

function showAudioCallScreen() {
    document.getElementById('homecreen').style.display = 'none';
    document.getElementById('recieved').style.display = 'none';
    document.getElementById('outgoing-call').style.display = 'none';
    document.getElementById('video-call').style.display = 'none';

    document.getElementById('audio-call').style.display = 'block'; // sirf audio call ki screen dikhao
}

// Socket event for incoming call
webrtcSocket.on('receivePing', data => {
    console.log("receivePing", data)
    console.log("✅ receivePing Local stream initialized successfully:", localStream);
    pendingCallData = data;
    document.getElementById('callerName').innerText = `${data.callerName} is calling`;
    document.getElementById('callerInfo').innerText = `Call from ${data.callerName}`;
    showReceivedCallScreen(); // Show received call screen instead of modal
});

webrtcSocket.on('receiveReversePing', async (data) => {
    console.warn("🚀 ~ socket.on ~ receiveReversePing data:", data)
    console.log('remoteStream', remoteStream);

    let audioTrack = localStream.getAudioTracks()[0];

    audioTrack.enabled = true; // Set mic to OFF by default
    const video = document.getElementById("remote-video");
    video.muted = false; // unmute the video
    

    // ✅ Unmute remote stream
const remoteVideo = document.getElementById("remote-video");
if (window.cachedRemoteStream) {
    remoteVideo.srcObject = window.cachedRemoteStream;
    remoteVideo.muted = false;
    console.log("🔊 Remote audio unmuted on accept.");
}

    if (data.action === 'decline') {
        console.log("deko m chala?")
        // alert('User B cancel the call')
        try {
            showDeclineScreen(); // 👈 Wrap in try-catch
        } catch (err) {
            console.error("❌ Error in showDeclineScreen():", err);
        }
    } else if (data.action === 'accept') {
        // By default, mute the microphone
        let audioTrack = localStream.getAudioTracks()[0];

        audioTrack.enabled = true; // Set mic to OFF by default

        console.log('Microphone is initially muted:', !audioTrack.enabled);

        if (videocalltype === true) {
            showVideoCallScreen();
        } else {
            showAudioCallScreen();
        }
        // processCall();
        // alert('User B accept the call')
        // ✅ Conditionally show screen based on call type
    }
});

// Accept Call
document.getElementById('acceptCall').onclick = function () {
    if (pendingCallData) {
        sendReversePing("accept");
        // By default, mute the microphone
       // Enable microphone for User B
       
       let audioTrack = localStream.getAudioTracks()[0];
       if (audioTrack) {
           audioTrack.enabled = true; // Unmute microphone
       }

        console.log('Microphone is initially muted:', !audioTrack.enabled);

          // When remote tracks arrive, display them.
    pc.ontrack = event => {
        if (!remoteStream) {
            remoteStream = new MediaStream();
            document.getElementById('remote-video').srcObject = remoteStream;
        }
        remoteStream.addTrack(event.track);
    };

        // Start media stream based on type
        if (pendingCallData.callType === "video") {
            videocalltype = true;
            audiocalltype = true;
            showVideoCallScreen(); // 👈 Show video call UI
        } else {
            videocalltype = false;
            audiocalltype = true;
            showAudioCallScreen(); // 👈 Custom audio UI
            // showVideoCallScreen();
        }
        // pendingCallData = null;
    }
};

// Decline Call
document.getElementById('declineCall').onclick = function () {
    if (pendingCallData) {
        sendReversePing("decline");
        // By default, mute the microphone
        let audioTrack = localStream.getAudioTracks()[0];

        audioTrack.enabled = false; // Set mic to OFF by default

        console.log('Microphone is initially muted:', !audioTrack.enabled);
        bydefaultScreen();
        pendingCallData = null;
    }
};


// Function to show video call UI
function showVideoCallScreen() {
    document.getElementById('homecreen').style.display = 'none';
    document.getElementById('recieved').style.display = 'none';
    document.getElementById('outgoing-call').style.display = 'none';
    document.getElementById('video-call').style.display = 'block';
    const remoteVideo = document.getElementById('remote-video');
    const localVideo = document.getElementById('draggable');

    if (remoteVideo && localVideo) {
        remoteVideo.style.display = "block";
        localVideo.style.display = "block";
    } else {
        console.error("Error: Video elements not found in DOM");
    }
}


function showDeclineScreen() {
    // Sab elements ko hide karo
    document.getElementById('homecreen').style.display = 'none';
    document.getElementById('recieved').style.display = 'none';
    document.getElementById('outgoing-call').style.display = 'none';
    document.getElementById('video-call').style.display = 'none';
    document.getElementById('audio-call').style.display = 'none';

    // Sirf decline screen dikhani hai
    document.getElementById('decline').style.display = 'block';
}

function bydefaultScreen() {
    // Sab elements ko hide karo
    document.getElementById('homecreen').style.display = 'none';
    document.getElementById('recieved').style.display = 'none';
    document.getElementById('outgoing-call').style.display = 'none';
    document.getElementById('decline').style.display = 'none';

    // Sirf default screen dikhani hai
    document.getElementById('video-call').style.display = 'block';
}





document.getElementById('mute-btn').addEventListener('click', () => {
    let audioTrack = localStream.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
    console.log('audioTrack.enabled', audioTrack.enabled)
    webrtcSocket.emit('micStatusChanged', {
        userId: callerId, // your current user ID
        micStatus: !audioTrack.enabled,
        remoteId: targetPeerId
    });

     // Update mic icon based on mute/unmute
     const muteIcon = document.querySelector('#mute-btn img');
     if (audioTrack.enabled) {
         muteIcon.src = '../static/images/unmute.png';
     } else {
         muteIcon.src = '../static/images/mute.png';
     }
     
    console.log('callerId', callerId);

    // socket.emit('micStatusChanged', { remoteId: targetPeerId, isMuted: !audioTrack.enabled });
});


document.getElementById('mute-btn-for-audio-call').addEventListener('click', () => {

    console.log('localstream from 795', localStream)

    let audioTrack = localStream.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
    console.log('audioTrack.enabled', audioTrack.enabled)
    webrtcSocket.emit('micStatusChanged', {
        userId: callerId, // your current user ID
        micStatus: !audioTrack.enabled,
        remoteId: targetPeerId
    });

     // Update mic icon based on mute/unmute
     const muteIcon = document.querySelector('#mute-btn-for-audio-call img');
     if (audioTrack.enabled) {
         muteIcon.src = '../static/images/unmute.png';
     } else {
         muteIcon.src = '../static/images/mute.png';
     }
     
    console.log('callerId', callerId);

    // socket.emit('micStatusChanged', { remoteId: targetPeerId, isMuted: !audioTrack.enabled });
});

webrtcSocket.on('micStatusChanged', data => {
    // alert(`Microphone status changed: ${data.micStatus ? 'Muted' : 'Unmuted'}`);
    document.getElementById('remoteMicStatus').innerHTML = data.micStatus
});

document.getElementById('video-btn').addEventListener('click', function () {
    let videoTrack = localStream.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled; // ✅ Video On/Off Toggle

    // ✅ Image Toggle Logic
    let videoBtnImg = this.querySelector("img"); // Get image inside button
    if (videoTrack.enabled) {
        videoBtnImg.src = "../static/images/📞 Decline (5).png"; // ✅ Video ON Image
    } else {
        videoBtnImg.src = "../static/images/📞 Decline (6).png"; // ✅ Video OFF Image
    }

    // ✅ Emit event to remote user
    webrtcSocket.emit('remoteToggleVideo', { calleeId: targetPeerId, isVideoOn: videoTrack.enabled });
});


webrtcSocket.on('remoteToggleVideo', isVideoOn => {
    // alert(`Remote video is now ${isVideoOn ? 'ON' : 'OFF'}`);
});

webrtcSocket.on('userLeft', () => {
    alert('The other user has left the call.');
});



// document.getElementById("mute-btn").addEventListener("click", () => {
//   console.log("callerId");
//   // webrtcSocket.emit('micStatusChanged', { remoteId: targetPeerId, isMuted: !audioTrack.enabled });
// });

// document.getElementById("mute-btn").addEventListener("click", () => {
//   console.log("callerId");
//   // webrtcSocket.emit('micStatusChanged', { remoteId: targetPeerId, isMuted: !audioTrack.enabled });
// });

// const mainVideo = document.querySelector('.main-video');
// const placeholderImage = document.getElementById('placeholderImage');

// // Sirf doosra button select karna
// const toggleBtn = document.querySelectorAll('.control-btn')[1];

// toggleBtn.addEventListener('click', () => {
//   if (mainVideo.style.display !== "none") {
//     mainVideo.style.display = "none";
//     placeholderImage.style.display = "block";
//     toggleBtn.classList.add('video-off'); // ✅ Button par line add karna
//   } else {
//     mainVideo.style.display = "block";
//     placeholderImage.style.display = "none";
//     toggleBtn.classList.remove('video-off'); // ✅ Line hatana
//   }
// });

// document.querySelector("#mute-btn img").addEventListener('click', function () {
//   if (this.src.includes("mute.png")) {
//     this.src = "images/📞 Decline (4).png"; // Unmute image
//   } else {
//     this.src = "images/mute.png"; // Mute image
//   }
// });
