const renderMessages = (users) => {
    if (!messagesList) {
        console.error("❌ messagesList element not found!");
        return;
    }

    messagesList.innerHTML = ""; // ✅ Pehli list clear karna

    users.forEach((user) => {
        let callImage = "";
        if (user.call_type === "video") {
            callImage = `<img src="../static/chatimg/Video call.png" alt="Video Call" class="call-icon" style="cursor: pointer;">`;
        } else if (user.call_type === "audio") {
            callImage = `<img src="../static/chatimg/calls.png" alt="Audio Call" class="call-icon" style="cursor: pointer;">`;
        }

        const listItem = document.createElement("li");
        listItem.classList.add("message-item");
        listItem.dataset.id = user.notification_id;
        
        listItem.innerHTML = `
            <a href="#" data-id="${user.notification_id}">
                <div class="image-wrapper">
                    <img src="${user.caller?.profile_image ? `https://enigmakey.tech/serv/files/${user.caller.profile_image}` : '../static/chatimg/user-profile.png'}" class="sender-image">
                </div>
                <div class="content-message-info">
                    <div class="message-header">
                        <span class="username">${user.caller?.username || "Unknown User"}</span>
                        <div class="message-icons">
                        ${callImage} 
                        </div>
                    </div>
                    <span class="message-text">${user.message || ""}</span>
                </div>
            </a>
        `;

        messagesList.appendChild(listItem); // ✅ Latest messages show honge
    });
};