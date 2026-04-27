// Function to check authentication
function checkAuth() {
    const token = localStorage.getItem("access_token"); // Token ko localStorage se lena

    const currentPage = window.location.pathname; // Current page ka path lena
    console.log("Current Page:", currentPage); // Debugging

    // Public pages (jahan authentication ki zaroorat nahi)
    const publicPages = ["/signin"];

    // Protected pages (jahan authentication required hai)
    const protectedPages = [
        "/home", "/chat", "/images", "/notification",
        "/profile", "/setting", "/starredgrp", "/starrredmsg", "/archieved", "/bioregister",
        "/create-group", "/next-grpage", "/call"
    ];

    if (token) {
        // ✅ Agar token hai
        console.log("User is authenticated.");
        
        // Agar user Sign In page pe hai aur already logged in hai, to Home page par redirect karein
        if (publicPages.includes(currentPage)) {
            window.location.href = "/home"; // Redirect to home if already logged in
        }
    } else {
        // ❌ Agar token nahi hai
        console.log("User is not authenticated.");
        
        // Agar user kisi protected page par hai, to usko Sign In page par bhej do
        if (protectedPages.includes(currentPage)) {
            window.location.href = "/timeoutpage"; // Redirect to sign in

            setTimeout(() => {
                location.reload(true); 
            }, 100);
        }
    }
}

// Call checkAuth when page loads
checkAuth();
