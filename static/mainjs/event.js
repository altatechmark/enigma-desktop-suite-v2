function isPincodeVerified() {
    return sessionStorage.getItem("pincode_verified") === "success";
  }

  const sessionStorageValue = isPincodeVerified();
  console.log("🚀 ~ sessionStorageValue:", sessionStorageValue);



  document.addEventListener('visibilitychange', () => {
    if (sessionStorageValue) {
      if (document.hidden) {
        console.log('🔴 Tab chhoda ya minimize kiya');
        // sessionStorage.removeItem('pincode_verified');
        // window.location.replace('/pincode');
      } else {
        console.log('🟢 Tab active kiya ya dobara page per aaya');
        sessionStorage.removeItem('pincode_verified');
        window.location.replace('/pincode'); 
        // if (!sessionStorageValue) {
        //     console.log("🚀 ~ document.addEventListener ~ sessionStorageValue:", sessionStorageValue)
        //     window.location.replace('/pincode'); 
        // }
        // window.location.replace('/pincode');
      }
    }
  });
  
//   window.addEventListener('blur', () => {
//     if (sessionStorageValue) {
//       console.log('🔸 Window blur: User ne page chhoda ya minimize kiya');
//     //   window.location.replace('/pincode');
//     }
//   });
  
//   window.addEventListener('focus', () => {
//     if (sessionStorageValue) {
//       console.log('🔹 Window focus: User dobara page per aaya');
//     //   window.location.replace('/pincode');
//     }
//   });
  

// Jb page reload hota hy tw ya chalta hy
//   window.addEventListener('load', () => {
//     if (sessionStorageValue) {
//       console.log('🔁 Page fully loaded / refresh hua');
//     //   window.location.replace('/pincode');
//     }
//   });
  
//   document.addEventListener('DOMContentLoaded', () => {
//     if (sessionStorageValue) {
//     //   console.log('📄 DOM ready (HTML parsed)');
//       // Optional redirect
//     }
//   });