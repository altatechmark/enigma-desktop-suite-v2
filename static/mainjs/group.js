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

const container = document.getElementById('image-container');
const numberOfImages = 8;  // Define the number of images you want to generate

// Array of image sources (replace these with your actual image paths)
const imageSources = [
    '../static/chatimg/pic1.png',
    '../static/chatimg/pic2.png',
    '../static/chatimg/pic3.png',
    '../static/chatimg/pic4.png',
    '../static/chatimg/pic5.png',
    '../static/chatimg/pic1.png',
    '../static/chatimg/pic2.png',
    '../static/chatimg/pic3.png'
];

// Loop to create and append images
for (let i = 0; i < numberOfImages; i++) {
    const imgElement = document.createElement('img');
    imgElement.src = imageSources[i]; // Set image source from the array
    imgElement.alt = `Icon ${i + 1}`; // Set a unique alt text for each image
    imgElement.style.width = '18%'; // Set image width to 18%
    imgElement.style.margin = '1%'; // Add some space between images
    imgElement.style.display = 'inline-block'; // Ensure images stay in the same row
    container.appendChild(imgElement); // Append the image to the container
}

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
            const fileItem = document.createElement("div");
            fileItem.classList.add("file-preview-item");
            fileItem.textContent = file.name;

            previewContainer.appendChild(fileItem);
        });
    });
}




const messages = [
    {
        id: 1,
        name: "Abdullah",
        image: "../static/chatimg/pic1.png",
        send: [`What is Lorem Ipsum?
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.

Why do we use it?
It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).


Where does it come from?`],
        receive: [`What is Lorem Ipsum?
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.

Why do we use it?
It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).


Where does it come from?`]
    },
    {
        id: 2,
        name: "Ahmed",
        image: "../static/chatimg/pic2.png",
        send: ["Hey, what's up?", "Do you need anything?"],
        receive: ["All good, thanks!", "Not right now."]
    },
    {
        id: 3,
        name: "Sara",
        image: "../static/chatimg/pic3.png",
        send: ["Hi Sara!", "Are you coming to the meeting?"],
        receive: ["Hi! Yes, I will be there."]
    },
    {
        id: 4,
        name: "Abd",
        image: "../static/chatimg/pic4.png",
        send: ["Hello, how are you?", "Are you available today?"],
        receive: ["I'm fine, thank you!", "Yes, I am."]
    },
    {
        id: 5,
        name: "Abdullah",
        image: "../static/chatimg/pic5.png",
        send: ["Hello Abdullah, how are you"],
        receive: ["I'm fine, thank you!"]
    },
    {
        id: 2,
        name: "Ahmed",
        image: "../static/chatimg/pic1.png",
        send: ["Hey, what's up?", "Do you need anything?"],
        receive: ["All good, thanks!", "Not right now."]
    },
    {
        id: 3,
        name: "Sara",
        image: "../static/chatimg/pic1.png",
        send: ["Hi Sara!", "Are you coming to the meeting?"],
        receive: ["Hi! Yes, I will be there."]
    },
    {
        id: 4,
        name: "Abd",
        image: "../static/chatimg/pic1.png",
        send: ["Hello, how are you?", "Are you available today?"],
        receive: ["I'm fine, thank you!", "Yes, I am."]
    },
    {
        id: 1,
        name: "Abdullah",
        image: "../static/chatimg/pic1.png",
        send: ["Hello Abdullah, how are you"],
        receive: ["I'm fine, thank you!"]
    },
    {
        id: 2,
        name: "Ahmed",
        image: "../static/chatimg/pic1.png",
        send: ["Hey, what's up?", "Do you need anything?"],
        receive: ["All good, thanks!", "Not right now."]
    },
    {
        id: 3,
        name: "Sara",
        image: "../static/chatimg/pic1.png",
        send: ["Hi Sara!", "Are you coming to the meeting?"],
        receive: ["Hi! Yes, I will be there."]
    },
    {
        id: 4,
        name: "Abd",
        image: "../static/chatimg/pic1.png",
        send: ["Hello, how are you?", "Are you available today?"],
        receive: ["I'm fine, thank you!", "Yes, I am."]
    }
]

// Render messages list
const messagesList = document.getElementById("messagesList");

function renderMessages(messages) {
    messagesList.innerHTML = "";  // Clear existing messages
    if (messages.length > 0) {
        messages.forEach((msg) => {
            const listItem = document.createElement("li");
            listItem.innerHTML = `
            <a href="#" data-id="${msg.id}" class="message-item">
    <img class="content-message-image" src="${msg.image}" alt="">
    <span class="content-message-info">
        <span class="content-message-name">${msg.name}</span>
        <span class="content-message-text">${msg.send[0]}</span>
        <span class="content-message-text">15 mint</span>
    </span>
    <div class="message-images">
        <img src="../static/chatimg/star.png" alt="">
        <img src="../static/chatimg/Lock (1).png" alt="">
        <img src="../static/chatimg/Shape 3 copy.png" alt="">
    </div>
</a>

            `;
            messagesList.appendChild(listItem);

            // console.log("🚀 ~ messages.forEach ~ listItem:", listItem)

        });
    } else {
        const noDataMessage = document.createElement("li");
        noDataMessage.innerHTML = `
            <span class="no-data-message">No data found!</span>
        `;
        messagesList.appendChild(noDataMessage);

    }

}

// Initial rendering of all messages
renderMessages(messages);

// Handle click events
messagesList.addEventListener("click", (e) => {
    e.preventDefault();
    const target = e.target.closest("a");
    if (!target) return;
    const id = parseInt(target.getAttribute("data-id"));
    const selectedMessage = messages.find((msg) => msg.id === id);
    if (selectedMessage) {
        renderConversation(selectedMessage);
    }
});

const conversationContainer = document.getElementById("conversation-container");

function renderConversation(message) {
    const { name, image, send, receive } = message;
    let conversationHTML = `
        <div class="conversation-top">
            <button type="button" class="conversation-back"><img src="../static/chatimg/Backward arrow sign.png" alt=""></button>
            <div class="conversation-user">
                <img class="conversation-user-image" src="${image}" alt=""/>
                <div>
                    <div class="conversation-user-name">${name}</div>
                    <div class="conversation-user-status online">online</div>
                </div>
            </div>
            <div class="conversation-buttons">
                <button type="button" class="video-call-btn"><i class="ri-vidicon-line"></i></button>
                <button type="button" class="audio-call-btn"><i class="ri-phone-fill"></i></button>
                <button type="button" class="notification-btn"><i class="ri-notification-3-line"></i></button>
                <button type="button" class="more-info-btn"><i class="ri-more-2-line"></i></button>
            </div>
        </div>
        <div class="conversation-main">
            <ul class="conversation-wrapper">
    `;

    send.forEach((text, index) => {
        conversationHTML += `
            <li class="conversation-item me">
                <div class="conversation-item-content">
                    <div class="conversation-item-text">${text}</div>
                    <img class="conversation-user-image" src="../static/chatimg/icon.png" alt="User Image"/>
                </div>
            </li>
        `;

        if (receive[index]) {
            conversationHTML += `
                <li class="conversation-item receiver">
                    <div class="conversation-item-content">
                        <img class="conversation-user-image" src="${image}" alt="User Image"/>
                        <div class="conversation-item-text">${receive[index]}</div>
                    </div>
                </li>
            `;
        }
    });

    conversationHTML += `
              </ul>
    </div>
    
    <div class="conversation-form">
        <input type="file" id="fileInput" class="hidden-file-input" multiple>

        <button type="button" class="conversation-form-button attachment-btn">
            <i class="ri-attachment-line"></i>
        </button>

        <textarea class="conversation-form-input" rows="1" placeholder="Type here..."></textarea>
        <button type="button" class="conversation-form-button conversation-form-submit send-btn">
            <i class="ri-send-plane-2-line"></i>
        </button>
        <button type="button" class="conversation-form-button conversation-form-submit mic-btn">
            <i class="ri-mic-line"></i>
        </button>
    </div>
    
    <div id="filePreviewContainer" class="file-preview"></div>

    `;

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

    // Voice recording feature
    let mediaRecorder;
    let audioChunks = [];

    micBtn.addEventListener("click", async () => {
        if (!mediaRecorder || mediaRecorder.state === "inactive") {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);

                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };
                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
                    const audioUrl = URL.createObjectURL(audioBlob);

                    const conversationWrapper = document.querySelector(".conversation-wrapper");
                    const audioMessage = document.createElement("li");
                    audioMessage.classList.add("conversation-item", "me");

                    // Sender Image
                    const senderImage = document.createElement("img");
                    senderImage.classList.add("conversation-user-image");
                    senderImage.src = "../static/chatimg/icon.png"; // Replace with actual sender image URL
                    senderImage.alt = "User Image";

                    // Audio Container
                    const audioContainer = document.createElement("div");
                    audioContainer.classList.add("audio-message");

                    // Play Button
                    const playButton = document.createElement("button");
                    playButton.innerHTML = '<i class="ri-play-circle-line"></i>';

                    // Duration Display
                    const durationElement = document.createElement("span");
                    durationElement.classList.add("audio-duration");
                    durationElement.textContent = "0:00";

                    // Waveform Container
                    const waveformContainer = document.createElement("div");
                    waveformContainer.classList.add("waveform");

                    // Append elements
                    // Add sender image before audio
                    audioContainer.appendChild(playButton);
                    audioContainer.appendChild(waveformContainer);
                    audioContainer.appendChild(durationElement);

                    audioMessage.appendChild(audioContainer);
                    conversationWrapper.appendChild(audioMessage);
                    audioMessage.appendChild(senderImage);

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

                    wavesurfer.load(audioUrl);

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

                    // Update Duration
                    wavesurfer.on('ready', () => {
                        const duration = Math.floor(wavesurfer.getDuration());
                        durationElement.textContent = `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, "0")}`;
                    });

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

    // Add event listeners for call buttons
    addButtonEventListeners();
}
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
// Filter messages by search query
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const filteredMessages = messages.filter((msg) => msg.name.toLowerCase().includes(query));
    renderMessages(filteredMessages);  // Re-render messages based on the filter
});


const chatContainer = document.querySelector(".conversation-wrapper");

function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Call this function every time a new message is added
scrollToBottom();
function activateButton(button, url) {
    // Remove 'active' class from all buttons
    const buttons = document.querySelectorAll('.action-button');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Add 'active' class to the clicked button
    button.classList.add('active');

    // Redirect to the respective URL
    window.location.href = url;
}

