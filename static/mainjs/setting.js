function enableEdit(button) {
    const box = button.closest('.box'); // Get the parent container
    const input = box.querySelector('input, textarea'); // Select either input or textarea inside the container

    if (input) {
        if (input.readOnly) {
            input.readOnly = false;
            input.focus();
            button.textContent = "Save";
        } else {
            input.readOnly = true;
            button.innerHTML = '<img src="images/Editing.png" alt="Edit Picture" class="edit-icon">';
        }
    }
}

// // Zoom Disable (Ctrl + Scroll)
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