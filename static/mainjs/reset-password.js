document.addEventListener("DOMContentLoaded", function () {
    const sendOtpButton = document.querySelector(".angled-button"); // Select the button

    sendOtpButton.addEventListener("click", async function (e) {
        e.preventDefault(); // Prevent form submission

        const email = document.getElementById("email").value.trim(); // Get email value
        if (!email) {
            showCustomAlert("Please enter your email.");
            return;
        }

        console.log("🚀 ~ Email:", email);

        try {
            const response = await fetch("https://enigmakey.tech/serv/generate-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email })
            });

            const result = await response.json();
            console.log("OTP Sent:", result);

            if (response.ok) {
                // Redirect to OTP screen with email as a query parameter
                window.location.href = `otp?email=${encodeURIComponent(email)}`;
            }

        } catch (error) {
            console.error("🚀 ~ SendOtp ~ error:", error);
        }
    });
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