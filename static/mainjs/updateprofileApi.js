var userId = '';
var currentUser1 = null;
// var allUsers = [];

// const getAllUsers = async () => {
//     const token = localStorage.getItem('access_token');
//     try {
//         const response = await fetch(`https://enigmakey.tech/serv/get-all-users`, {
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${token}`,
//                 'Content-Type': 'application/json',
//             },
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }

//         const data = await response.json();
//         console.log("users", data);

//         // ✅ `allUsers` array ko update kar diya
//         allUsers = data.users || [];

//         return allUsers; // ✅ Filtered users return ho rahe hain
//     } catch (error) {
//         console.error('getAllUsers error', error);
//     }
// };




//getting logged in user data functin start
const getCurrentUserData = async () => {
    const token = localStorage.getItem('access_token');

    try {
        const response = await fetch('https://enigmakey.tech/serv/get-user-profile', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();
        console.log("🚀 ~ getCurrentUserData ~ response:", data?.user);
        callerDeviceType = data.user.device_type

        if (data?.user) {
            currentUser1 = {
                ...data.user,
                profileImage: data.user.profile_image
                    ? `https://enigmakey.tech/serv/files/${data.user.profile_image}`
                    : `../static/chatimg/bydefaultimg.png`
            };

            userId = data.user.id;
            console.log("✅ Updated currentUser:", currentUser1);

            // localStorage.setItem('currentUser', JSON.stringify(currentUser));

        } else {
            console.log("⚠️ User data not found!");
        }

        return currentUser1;

    } catch (error) {
        console.log("🚀 ~ getCurrentUserData ~ error:", error);
        return null;
    }
};


getCurrentUserData().then((user) => {
    if (user) {
        console.log("🚀 ~ After async call, currentUser:", user);
        console.log("🚀 ~ After async call, userId:", user.id);
        // getAllUsers();
    } else {
        console.log("❌ Failed to fetch user data.");
    }
});
//getting logged in user data functin end

// update profile func start
const updateUserProfile = async () => {
    const user = await getCurrentUserData();
    console.log("user for profile",user)
    if (user) {
        // Update all profile images
        document.querySelectorAll(".profile img:first-child").forEach(img => {
            img.src = user.profileImage;
        });

        // Update all profile names
        document.querySelectorAll(".profile span").forEach(span => {
            span.textContent = `${user.first_name} ${user.last_name}`;
        });

        // Update all emails (only targets small tags with class 'user-email')
        document.querySelectorAll(".profile .user-email").forEach(email => {
            email.textContent = user.email;
        });
    }
};


// Call function to update profile image and name when page loads
updateUserProfile();

// update profile func end