// setTimeout(() => {
//     window.location.href = 'signin'
// }, 3000);

const accessToken = localStorage.getItem('access_token');

const checkUserSession = async () => {
     await  fetch("https://enigmakey.tech/serv/check-session", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log("Response:", data);

        if (data?.is_logged_in === true) {
           window.location.href = 'pincode' 
        } else {
            window.location.href = 'signin'  
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
};

checkUserSession();


