const device_type = 'desktop';


const checkCode = async (accessToken) => {
 await fetch("https://enigmakey.tech/serv/check-code", {
    method: "GET",
    headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
    }
})
.then(response => response.json())
.then(data => {
    console.log("Response:", data);
    if (data?.code_saved === true) {
      window.location.href = '/pincode';
    } else {
      window.location.href = '/createpin';
    }
})
.catch(error => {
    console.error("Error:", error);
});
}


document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, device_type }),
    });

    const result = await response.json();

      // Check if response is not ok (like 403, 400, 500 etc.)
  if (!response.ok) {
    if (response.status === 403) {
      showCustomAlert("Admin doesn't allow you to use your account in this location. Please contact your admin.");
    } else {
      showCustomAlert(result.message || 'Invalid email or password, or a server error occurred. Please try again.');
    }
    return;
  }

    if (result.success) {
      //alert('Login successful!');
      localStorage.setItem('access_token', result.access_token);
      checkCode(result.access_token)

      // setTimeout(() => {
      //   checkCode(result.access_token)
      // }, 1000);
      // window.location.href = result.redirect_url; //Asad route
    } else {
      showCustomAlert(result.message || 'Login failed!');
    }
  } catch (error) {
    console.error('Error:', error);
    showCustomAlert('An error occurred. Please try again later.');
  }
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
