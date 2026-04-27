// Define initial state
let currentIndex = 0;
const images = [
  document.getElementById('biometric-image'),
  document.getElementById('biometric-image-2'),
  document.getElementById('biometric-image-3'),
  document.getElementById('biometric-image-4')
];
const nextButton = document.getElementById('next-button');
const progressText = document.getElementById('progress-text');
const modal = new bootstrap.Modal(document.getElementById('exampleModal'));

// Function to update the images
function updateImages() {
  // Hide all images
  images.forEach(img => img.style.display = 'none');
  
  // Show the current image
  if (currentIndex < images.length) {
    images[currentIndex].style.display = 'block';
  }

  // Update the progress text
  progressText.innerText = `${currentIndex + 1}/4`;
}

// Add event listener to the button
nextButton.addEventListener('click', function() {
  // Increment index and update images
  if (currentIndex < images.length) {
    currentIndex++;
    updateImages();
  }

  // After the 4th image (i.e., the 5th click), show the modal
  if (currentIndex === 4) {
    modal.show();
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