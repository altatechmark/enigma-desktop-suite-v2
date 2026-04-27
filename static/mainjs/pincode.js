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


// const form = document.getElementById("update-password-form");

// form.addEventListener("submit", (e) => {
//     e.preventDefault(); // form submit hone pe page reload na ho

//     const otpInputs = document.querySelectorAll(".otp-input");
//     let pin = "";

//     otpInputs.forEach(input => {
//         pin += input.value;
//     });

//     console.log("Entered PIN:", pin);

//        // 👇 Real verification check
//        if (pin === "123456") { // ← Replace with your actual logic or backend call
//         sessionStorage.setItem("pincode_verified", "success");
//         window.location.href = "/home"; // or wherever you want to go after success
//     } else {
//         alert("❌ Wrong PIN. Try again.");
//     }
// });

// function verifyCode(otpCode) {
//     fetch("https://enigmakey.tech/serv/verify-code", {
//         method: "POST",
//         headers: {
//             "Authorization": `Bearer ${accessToken}`,
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//             code: otpCode  // Assuming the server expects a field named 'code'
//         })
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log("Verification response:", data);
//         // You can handle success/failure based on the 'data'
//     })
//     .catch(error => {
//         console.error("Error verifying code:", error);
//     });
// }


// document.addEventListener("wheel", function (event) {
//     if (event.ctrlKey) {
//         event.preventDefault();
//     }
// }, { passive: false });

// // Right-Click Disable
// document.addEventListener("contextmenu", function (event) {
//     event.preventDefault();
// });

// // Keyboard Shortcuts Disable
// document.addEventListener("keydown", function (event) {
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

// // Disable Back Button
history.pushState(null, "", location.href);
window.onpopstate = function () {
    history.pushState(null, "", location.href);
};

// // Disable F5, Ctrl+R
document.addEventListener("keydown", function (event) {
    if (event.key === "F5" || (event.ctrlKey && event.key === "r")) {
        event.preventDefault();
    }
});



async function pinSubmit(e) {
    e.preventDefault(); // Stop form reload
    const accessToken = localStorage.getItem('access_token');

    const otpInputs = document.querySelectorAll(".otp-input");
    let pin = "";

    otpInputs.forEach(input => {
        pin += input.value;
    });

    console.log("Entered PIN:", pin);

   await fetch("https://enigmakey.tech/serv/verify-code", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            code: pin,  // Assuming the server expects a field named 'code'
             device_type: 'desktop'
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Verification response:", data);
        // You can handle success/failure based on the 'data'

     setTimeout(() => {
        if (data?.message === "Code verified") {
            sessionStorage.setItem("pincode_verified", "success");
            window.location.href = "/home";  
            // window.history.back();
        } else if (data?.error === "Code mismatch") {
            showCustomAlert('You have entered an incorrect PIN. Please enter the correct PIN to access your account.')
        }
     }, 1000);
        
        // if (data?.error === 'Code mismatch') {
        //     alert('You have entered an incorrect PIN. Please enter the correct PIN to access your account.')
        // }
    })
    .catch(error => {
        console.error("Error verifying code:", error);
    });

    // if (pin === "123456") {
    //     sessionStorage.setItem("pincode_verified", "success");
    //     window.location.href = "/home";
    // } else {
    //     alert("❌ Wrong PIN. Try again.");
    // }
}


// List of protected paths
const protectedRoutes = [
  "/home", "/images", "/notification",
  "/profile", "/setting", "/starredgrp", "/starrredmsg", "/archieved",
  "/bioregister", "/create-group", "/next-grpage", "/call"
];

// Check function
function isPincodeVerified() {
  return sessionStorage.getItem("pincode_verified") === "success";
}

// Route Protection
function guardRoute() {
  const currentPath = window.location.pathname;

  if (protectedRoutes.includes(currentPath) && !isPincodeVerified()) {
    window.location.replace("/pincode"); // Fast redirect without history entry
  }
}

// Call on load
window.addEventListener("DOMContentLoaded", guardRoute);
window.addEventListener("popstate", guardRoute);

// Intercept pushState/replaceState
(function(history) {
  const originalPush = history.pushState;
  history.pushState = function() {
    originalPush.apply(this, arguments);
    guardRoute();
  };
})(window.history);

function showCustomAlert(message) {
    document.getElementById('custom-alert-message').textContent = message;
    document.getElementById('custom-alert').style.display = 'flex';
  }
  
  function hideCustomAlert() {
    document.getElementById('custom-alert').style.display = 'none';
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.body.style.userSelect = 'none';

    // Also disable mouse-based selection
    document.body.addEventListener('selectstart', function (e) {
        e.preventDefault();
    });
});
