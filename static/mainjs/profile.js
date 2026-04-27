function goBack() {
    window.history.back();
  }

// Function to fetch logged-in user data


async function getCurrentUserData() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        showCustomAlert("User token not found. Please log in again.");
        window.location.href = "/login"; // Redirect to login page
        return null;
    }

    try {
        const response = await fetch('https://enigmakey.tech/serv/get-user-profile', {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        console.log("API Response:", data); // Debugging
        if (data?.user) {
            return {
                profileImage: data.user.profile_image ? `https://enigmakey.tech/serv/files/${data.user.profile_image}` : "../static/chatimg/user-profile.png",
                firstName: data.user.first_name || "",
                lastName: data.user.last_name || "",
                phone: data.user.phone_number || "",
                website: data.user.website || "",
                address: data.user.address || "",
                description: data.user.description || "",
            };
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
    return null;
}

// Function to update the UI with user profile data
async function updateUserProfile() {
    const user = await getCurrentUserData();
    if (user) {
        document.getElementById("profilePicture").src = user.profileImage;
        document.getElementById("userFullName").textContent = `${user.firstName} ${user.lastName}`.trim() || "User";
        document.getElementById("firstName").value = user.firstName;
        document.getElementById("website").value = user.website;
        document.getElementById("address").value = user.address;
        document.getElementById("description").value = user.description;
    }
}

// Function to enable editing and save changes
function enableEdit(button) {
    const box = button.closest('.box'); // Get the parent box
    const inputField = box.querySelector("input, textarea"); // Find the input or textarea

    if (!inputField) return; // If no input found, exit

    if (inputField.readOnly) {
        // If in read-only mode, enable editing
        inputField.readOnly = false;
        inputField.focus();
        button.innerHTML = "✔"; // Change button to checkmark
        button.classList.add("save-button"); // Add save button class for styling
    } else {
        // If editing, save changes
        saveUserProfile(inputField.id, inputField.value);
        console.log("Save called with:", inputField.id, inputField.value);
        inputField.readOnly = true;
        button.innerHTML = `<img src="../static/images/Editing.png" alt="Edit Picture" class="edit-icon">`; // Reset button
        button.classList.remove("save-button");
    }
}

// Function to send updated data to API
async function saveUserProfile(field, value) {
    const token = localStorage.getItem("access_token");
    if (!token) {
        showCustomAlert("User token not found. Please log in again.");
        window.location.href = "/login";
        return;
    }

    const fieldMap = {
        firstName: "first_name",
        website: "website",
        address: "address",
        description: "description"
    };

    const apiField = fieldMap[field] || field;

    const formData = new FormData();
    formData.append(apiField, value);

    try {
        const response = await fetch("https://enigmakey.tech/serv/update-user-profile", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });

        const result = await response.json();
        if (response.ok) {
            showCustomAlert(result.message || "Profile updated successfully!");
        } else {
            showCustomAlert(result.error || "Failed to update profile.");
        }
    } catch (error) {
        console.error("Error updating user profile:", error);
    }
}


// Function to handle profile image selection and upload
async function pickProfileImage(event) {
    const file = event.target.files[0]; // Get selected file
    if (!file) return;

    // Preview selected image
    const imageUrl = URL.createObjectURL(file);
    document.getElementById("profilePicture").src = imageUrl;

    // Prepare form data for submission
    const formData = new FormData();
    formData.append('first_name', document.getElementById("firstName").value);
    formData.append('website', document.getElementById("website").value);
    formData.append('address', document.getElementById("address").value);
    formData.append('description', document.getElementById("description").value);
    formData.append('profile_image', file); // Append selected file

    // Get token from localStorage
    const token = localStorage.getItem("access_token");
    if (!token) {
        showCustomAlert("User token not found. Please log in again.");
        window.location.href = "/login"; // Redirect to login page
        return;
    }

    // Send the request to update profile
    try {
        const response = await fetch("https://enigmakey.tech/serv/update-user-profile", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData // Send form data as multipart
        });

        const result = await response.json();
        if (response.ok) {
            document.getElementById("profilePicture").src = `https://enigmakey.tech/serv/files/${result.updatedProfileImage}`;
            showCustomAlert(result.message || "Profile updated successfully!");
            updateUserProfile(); // Refresh profile data
        } else {
            showCustomAlert(result.error || "Failed to update profile.");
        }
    } catch (error) {
        console.error("Error updating user profile:", error);
    }
}




// Attach event listener to file input
document.getElementById("imageUpload").addEventListener("change", pickProfileImage);

// Load user profile on page load
document.addEventListener("DOMContentLoaded", updateUserProfile);

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
