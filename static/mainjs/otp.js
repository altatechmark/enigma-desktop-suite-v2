document.addEventListener("DOMContentLoaded", function () {
    // Function to get query parameter
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    const email = getQueryParam("email"); // Get email from URL
    if (!email) {
        console.error("No email found!");
        showCustomAlert("Invalid request. No email provided.");
        return;
    }
    console.log("Received Email:", email);

    const otpInputs = document.querySelectorAll(".otp-input");
    const passwordInput = document.getElementById("new-password");
    const updatePasswordForm = document.getElementById("update-password-form");

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

    // Handle form submission
    updatePasswordForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const otpValue = Array.from(otpInputs).map(input => input.value).join("");
        const newPassword = passwordInput.value.trim();

        if (otpValue.length !== otpInputs.length) {
            showCustomAlert("Please enter the complete OTP.");
            return;
        }
        if (newPassword.length < 6) {
            showCustomAlert("Password must be at least 6 characters.");
            return;
        }

        console.log("Entered OTP:", otpValue);
        console.log("New Password:", newPassword);

        try {
            const response = await fetch("https://enigmakey.tech/serv/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email,
                    otp: otpValue,
                    new_password: newPassword
                })
            });

            const result = await response.json();
            console.log("Response:", result);

            if (response.ok) {
                showCustomAlert("Password Updated Successfully!");
                window.location.href = "signin"; // Redirect to login page
            } else {
                showCustomAlert(result.message || "Error updating password. Please try again.");
            }

        } catch (error) {
            console.error("Error updating password:", error);
            showCustomAlert("Something went wrong. Please try again.");
        }
    });

    // Timer logic for Resend OTP
    let timerSeconds = 30;
    const timerElement = document.getElementById("timer");
    const resendLink = document.getElementById("resend-link");

    function startTimer() {
        resendLink.style.pointerEvents = "none";
        const countdown = setInterval(() => {
            if (timerSeconds <= 0) {
                clearInterval(countdown);
                resendLink.style.pointerEvents = "auto";
                timerElement.textContent = "";
            } else {
                timerElement.textContent = `(${timerSeconds}s)`;
                timerSeconds--;
            }
        }, 1000);
    }

    startTimer();
});

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
