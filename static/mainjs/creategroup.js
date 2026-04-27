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