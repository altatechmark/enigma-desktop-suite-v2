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

const mainVideo = document.querySelector('.main-video');
const placeholderImage = document.getElementById('placeholderImage');

// Sirf doosra button select karna
const toggleBtn = document.querySelectorAll('.control-btn')[1];

toggleBtn.addEventListener('click', () => {
    if (mainVideo.style.display !== "none") {
        mainVideo.style.display = "none";
        placeholderImage.style.display = "block";
        toggleBtn.classList.add('video-off'); // ✅ Button par line add karna
    } else {
        mainVideo.style.display = "block";
        placeholderImage.style.display = "none";
        toggleBtn.classList.remove('video-off'); // ✅ Line hatana
    }
});

const videoCallContainer = document.querySelector('.video-call-container');
const minimizeBtn = document.querySelectorAll('.window-controls span')[0]; // Minimize Button
const maximizeBtn = document.querySelectorAll('.window-controls span')[1]; // Maximize Button
const closeBtn = document.querySelectorAll('.window-controls span')[2]; // Close Button

// ✅ Minimize: Video call container ko chhota karna
minimizeBtn.addEventListener('click', () => {
    videoCallContainer.style.width = '400px';  // ✅ Sirf width change kare
    videoCallContainer.style.height = '300px'; // ✅ Sirf height change kare
    videoCallContainer.style.opacity = '0.8'; 
    videoCallContainer.style.position = 'fixed'; // ✅ Fixed rakhein taake layout na toote
    videoCallContainer.style.bottom = '10px'; // ✅ Screen ke neeche le aaye
    videoCallContainer.style.right = '10px';  // ✅ Right corner pe le aaye
});


// ✅ Maximize: Wapas full screen
maximizeBtn.addEventListener('click', () => {
    videoCallContainer.style.width = '100%';  // Wapas full width
    videoCallContainer.style.height = '100vh'; // Wapas full height
    videoCallContainer.style.opacity = '1'; 
    videoCallContainer.style.position = 'relative'; // Normal position
    videoCallContainer.style.bottom = ''; 
    videoCallContainer.style.right = '';  
});


// ✅ Close: Video call container hide karna
closeBtn.addEventListener('click', () => {
    videoCallContainer.style.display = 'none'; // Hide
});
// End Call Button ko select karna
const endCallBtn = document.querySelector('.control-btn.end-call');

// Button pe click hone par page redirect karega
endCallBtn.addEventListener('click', () => {
    window.location.href = 'declinecall.html';  // ✅ Redirect to decline.html
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