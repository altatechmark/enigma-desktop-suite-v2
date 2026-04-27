function submitTicket() {
    showCustomAlert("Ticket submitted successfully!");
}



document.addEventListener("DOMContentLoaded", function () {
    const productInput = document.querySelector("input[placeholder='Enter product name']");
    const complaintTypeInput = document.querySelector("input[placeholder='Enter complaint type']");
    const detailsInput = document.querySelector("textarea[placeholder='Describe your issue...']");
    const urgentToggle = document.getElementById("urgentToggle");
    const priorityText = document.getElementById("priority");
    const attachButton = document.querySelector(".attach");
    const fileInput = document.createElement("input");
    const submitButton = document.querySelector(".submit");

    let selectedFile = null;
    const token = localStorage.getItem('access_token');

    // File Picker
    fileInput.type = "file";
    fileInput.style.display = "none";
    fileInput.accept = "*/*"; // Accept all file types

    attachButton.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", function (event) {
        if (event.target.files.length > 0) {
            selectedFile = event.target.files[0];
            attachButton.innerText = `Attached: ${selectedFile.name}`;
        }
    });

    document.body.appendChild(fileInput); // Append file input to the body

    // Update Priority Text on Toggle
    urgentToggle.addEventListener("change", function () {
        priorityText.innerText = this.checked ? "Priority is Urgent" : "Priority is Normal";
    });

    // Submit Ticket Function
    submitButton.addEventListener("click", async function () {
        const product = productInput.value.trim();
        const complaintType = complaintTypeInput.value.trim();
        const details = detailsInput.value.trim();
        const priority = urgentToggle.checked;

        if (!product || !complaintType || !details) {
            showCustomAlert("⚠ Please fill in all required fields.");
            return;
        }

        if (!token) {
            showCustomAlert("⚠ Unauthorized! Please log in.");
            return;
        }

        const formData = new FormData();
        formData.append("product", product);
        formData.append("complain_type", complaintType);
        formData.append("priority", priority);
        formData.append("complain_detail", details);

        if (selectedFile) {
            formData.append("file", selectedFile);
        }

        try {
            const response = await fetch("https://enigmakey.tech/serv/create_ticket", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                showCustomAlert("✅ Ticket created successfully!");
                window.location.href = "helpsupport"; // Redirect to support page
            } else {
                showCustomAlert(`❌ Error: ${result.message || "Failed to create ticket."}`);
            }
        } catch (error) {
            console.error("🚀 ~ API Error:", error);
            showCustomAlert("❌ Something went wrong. Please try again.");
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
