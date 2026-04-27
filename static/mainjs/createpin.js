const otpInputs = document.querySelectorAll(".otp-input");


// Auto move to next input on typing
otpInputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
        if (!/^\d$/.test(e.target.value)) {
            e.target.value = ""; // Allow only numbers
            return;
        }
        if (index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
        }
    });

    // Move to previous input on backspace
    input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && index > 0 && !input.value) {
            otpInputs[index - 1].focus();
        }
    });
});


async function pinSubmit(e) {
    e.preventDefault(); // Stop form reload

    const token = localStorage.getItem('access_token');

    try {
        const otpInputs = document.querySelectorAll(".otp-input");
        let pin = "";
    
        otpInputs.forEach(input => {
            pin += input.value;
        });
    
        console.log("Entered PIN:", pin);

        
        const response = await fetch('https://enigmakey.tech/serv/save-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({code: pin}),
        });
    
        const result = await response.json();
        console.log("🚀 ~ pinSubmit ~ result:", result);
        if (result.message !== '') {
            showCustomAlert('PIN has been created successfully.');
            window.location.href = '/pincode'
        }
        } catch (error) {
        console.error('Error:', error);
        showCustomAlert('An error occurred. Please try again later.');
      }


}

function showCustomAlert(message) {
    document.getElementById('custom-alert-message').textContent = message;
    document.getElementById('custom-alert').style.display = 'flex';
  }
  
  function hideCustomAlert() {
    document.getElementById('custom-alert').style.display = 'none';
  }

  document.addEventListener("wheel", function (event) {
    if (event.ctrlKey) {
        event.preventDefault();
    }
}, { passive: false });

// Right-Click Disable
document.addEventListener("contextmenu", function (event) {
    event.preventDefault();
});

// Keyboard Shortcuts Disable
document.addEventListener("keydown", function (event) {
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

// // Disable F5, Ctrl+R
document.addEventListener("keydown", function (event) {
    if (event.key === "F5" || (event.ctrlKey && event.key === "r")) {
        event.preventDefault();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    document.body.style.userSelect = 'none';

    // Also disable mouse-based selection
    document.body.addEventListener('selectstart', function (e) {
        e.preventDefault();
    });
});
