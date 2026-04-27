// Get the button and the popup container
const moreInfoButton = document.querySelector('.more-info-btn');
const popupContainer = document.querySelector('.popup-container');

// Toggle the popup visibility when the button is clicked
moreInfoButton.addEventListener('click', () => {
    const buttonRect = moreInfoButton.getBoundingClientRect(); // Get the button's position

    // Position the popup below the button, aligned with the left edge of the button
    popupContainer.style.left = `${buttonRect.left}px`;
    popupContainer.style.top = `${buttonRect.bottom}px`;

    // Toggle the visibility of the popup
    popupContainer.classList.toggle('show');
});

// Close the popup if clicked outside
document.addEventListener('click', (event) => {
    if (!popupContainer.contains(event.target) && event.target !== moreInfoButton) {
        popupContainer.classList.remove('show');
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

const messages = [
    {
        id: 1,
        name: "Abdullah",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ix",
        send: ["Hello Abdullah, how are you"],
        receive: ["I'm fine, thank you!"]
    },
    {
        id: 2,
        name: "Ahmed",
        image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHBlb3BsZXxlbnwwfHwwfHx8MA&auto=format&fit=crop&w=500&q=60",
        send: ["Hey, what's up?", "Do you need anything?"],
        receive: ["All good, thanks!", "Not right now."]
    },
    // Add more messages here...
];

const messagesList = document.getElementById("messagesList");

function renderMessages(messages) {
    if (!messagesList) return;  // Check if messagesList exists
    messagesList.innerHTML = ""; // Clear existing messages
    messages.forEach((msg) => {
        const listItem = document.createElement("li");
        listItem.classList.add('message-item');
        listItem.innerHTML = `
            <a href="#" data-id="${msg.id}">
                <img src="${msg.image}" alt="Image" width="40">
                <div class="content-message-info">
                    <span>${msg.name}</span>
                    <span>${msg.send[0]}</span>
                </div>
                <div class="image-containe">
                    <input type="checkbox" class="message-checkbox">
                </div>
            </a>
        `;
        messagesList.appendChild(listItem);
    });
}

// Initial rendering of all messages
renderMessages(messages);

// Function to render the detailed conversation when a message is clicked
function renderConversation(message) {
    const conversationContainer = document.getElementById("conversationContainer");
    if (!conversationContainer) return;  // Check if conversationContainer exists
    conversationContainer.innerHTML = `
        <div class="message-details">
            <img src="${message.image}" alt="${message.name}" class="sender-image">
            <div class="message-content">
                <p><strong>${message.name}</strong></p>
                <p>${message.send.join("<br>")}</p>
                <p>${message.receive.join("<br>")}</p>
            </div>
        </div>
    `;
}

// Handle click events on messages
messagesList.addEventListener("click", (e) => {
    if (e.target.classList.contains("message-checkbox")) {
        return; // Agar checkbox pe click ho to preventDefault apply na ho
    }
    e.preventDefault(); // Baqi sab par default behavior prevent ho
    const target = e.target.closest("a");
    if (!target) return;
    const id = parseInt(target.getAttribute("data-id"));
    const selectedMessage = messages.find((msg) => msg.id === id);
    if (selectedMessage) {
        renderConversation(selectedMessage);
    }
});
