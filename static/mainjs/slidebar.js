function toggleSidebar() {
    let sidebar = document.getElementById("sidebar");
    let sidebarMain = document.getElementById("sidebarMain");

    if (sidebar.classList.contains("open")) {
        sidebar.classList.remove("open");
        sidebarMain.style.display = "none"; // Hide background overlay
    } else {
        sidebar.classList.add("open");
        sidebarMain.style.display = "block"; // Show background overlay
    }
}

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