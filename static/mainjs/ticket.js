document.addEventListener("DOMContentLoaded", function () {
    // Handle Priority Toggle
    const urgentToggle = document.getElementById("urgentToggle");
    const priorityText = document.getElementById("priority");

    if (urgentToggle && priorityText) {
        urgentToggle.addEventListener("change", function () {
            priorityText.innerText = this.checked ? "Priority is Urgent" : "Priority is Normal";
        });
    } else {
        console.error("🚀 ~ urgentToggle or priority element not found!");
    }

    // Fetch User Data
    const getCurrentUserData = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            console.error("🚀 ~ No access token found!");
            return null;
        }

        try {
            const response = await fetch('https://enigmakey.tech/serv/get-user-profile', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            console.log("🚀 ~ getCurrentUserData ~ response:", data?.user);

            if (data?.user) {
                const currentUser = {
                    ...data.user,
                    profileImage: data.user.profile_image
                        ? `https://enigmakey.tech/serv/files/${data.user.profile_image}`
                        : `../static/chatimg/bydefaultimg.png`
                };

                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                console.log("✅ Updated currentUser:", currentUser);
                // initializeSocket();

                return currentUser;
            } else {
                console.log("⚠️ User data not found!");
                return null;
            }
        } catch (error) {
            console.error("🚀 ~ getCurrentUserData ~ error:", error);
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

    // Fetch Ticket Data
    const ticketContainer = document.querySelector(".ticket-info");

    const getTickets = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                ticketContainer.innerHTML = "<p>Please log in to view tickets.</p>";
                return;
            }
    
            const response = await fetch('https://enigmakey.tech/serv/get_user_tickets', {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
    
            const data = await response.json();
            console.log("🚀 ~ getTickets ~ response:", data);
    
            const tickets = data?.tickets || [];
            if (tickets.length === 0) {
                ticketContainer.innerHTML = "<p>No tickets found.</p>";
                return;
            }
    
            // ✅ Wrap tickets properly
            let ticketHTML = `<div class="ticket-container">`;
    
            tickets.forEach(ticket => {
                const status = ticket.Status ? ticket.Status.toLowerCase() : "unknown";
                const priority = ticket.Priority ? ticket.Priority.toLowerCase() : "normal";
                const attachmentUrl = ticket.Attachment ? `https://enigmakey.tech/serv${ticket.Attachment}` : null;
    
                ticketHTML += `
                    <div class="ticket-card">
                        <h1 class="ticket-heading">Ticket Info</h1>
                        <p>Ticket ID: <span class="ticket-id">#${ticket.TicketID || "N/A"}</span></p>
                        <p class="complaint-row">
                            <span class="left-text">Created:</span>
                            <span class="right-text">${ticket.Created ? new Date(ticket.Created).toLocaleDateString() : "N/A"}</span>
                        </p>
                        <p>Status: <span class="status ${status}">${ticket.Status || "Unknown"}</span></p>
                        <p>Priority: <span class="priority ${priority}">${ticket.Priority || "Normal"}</span></p>
                        <p class="complaint-row">
                            <span class="left-text">Complaint Type:</span>
                            <span class="right-text">${ticket.ComplainType || "N/A"}</span>
                        </p>
                        <p class="complaint-row">
                            <span class="left-text">Complaint Detail:</span>
                            <span class="right-text">${ticket.ComplainDetail || "N/A"}</span>
                        </p>
                        ${attachmentUrl ? `<p>Attachment: <a href="${attachmentUrl}" target="_blank" class="Attachment">View File</a></p>` : ""}
                    </div>
                `;
            });
    
            ticketHTML += `</div>`;
    
            // ✅ Show in container
            ticketContainer.innerHTML = ticketHTML;
        } catch (error) {
            console.error("🚀 ~ getTickets ~ error:", error);
            ticketContainer.innerHTML = "<p>Error loading tickets. Please try again.</p>";
        }
    };
    
    // ✅ Call function
    getTickets();
    
    
    

    // Disable Zoom (Ctrl + Scroll)
    // document.addEventListener("wheel", function (event) {
    //     if (event.ctrlKey) {
    //         event.preventDefault();
    //     }
    // }, { passive: false });

    // // Disable Right-Click
    // document.addEventListener("contextmenu", function (event) {
    //     event.preventDefault();
    // });

    // // Disable Certain Keyboard Shortcuts
    // document.addEventListener("keydown", function (event) {
    //     if (event.ctrlKey || event.metaKey) {
    //         event.preventDefault();
    //     }

    //     const disabledKeys = ["F12", "F11", "F10", "F9", "F8", "F7", "F6", "F5", "F4", "F3", "F2", "F1"];
    //     if (disabledKeys.includes(event.key)) {
    //         event.preventDefault();
    //     }
    // });
});

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
