document.addEventListener("DOMContentLoaded", () => {
    const declineBtn = document.querySelector('.btn.decline'); // ✅ Sahi selector use karein

    if (declineBtn) {  // ✅ Null check taake error na aaye
        declineBtn.addEventListener('click', () => {
            window.location.href = 'chat.html'; // ✅ Redirect to chat.html
        });
    } else {
        console.error("Error: '.btn.decline' button not found!");
    }
});

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