
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

const FetchMedia = async () => {
    try {
        const response = await fetch(`https://enigmakey.tech/serv/get_uris?name1=${currentUser.username}&name2=${selectedUser.username}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const imagePaths = data?.uris || []; // API se images ka array

        const conversationImagesContainer = document.querySelector('.conversation-images');
        conversationImagesContainer.innerHTML = ''; // Pehle se jo images hain, unko clear karo

        // Images ko container me add karo
        imagePaths.forEach(imageSrc => {
            const imgElement = document.createElement('img');
            imgElement.src = imageSrc;
            imgElement.alt = "Chat Image";
            conversationImagesContainer.appendChild(imgElement);
        });

        console.log("Fetched Media:", imagePaths); // Debugging ke liye

    } catch (error) {
        console.error("🚀 ~ FetchMedia ~ error:", error);
    }
};

// Function ko call karo
FetchMedia();

