var socket = io('http://127.0.0.1:3000'); // Server ka address specify karein

//prompt to ask user's name 
// const name = prompt('Welcome! Please enter your name:')

// // emit event to server with the user's name
// socket.emit('new-connection', {username: name})

// // get elements of our html page
// const demoChatContainer = document.getElementById('demo-chat-container')
// const messageInput = document.getElementById('messageInput')
// const messageForm = document.getElementById('messageForm')

// messageForm.addEventListener('submit', (e) => {
//   e.preventDefault()
//   if(messageInput.value !== ''){
//     let newMessage = messageInput.value
//     socket.emit('new-message', {user: socket.id, message: newMessage})
//     addMessage({message: newMessage}, 'my' )
//     messageInput.value = ''
//   }else{
//     messageInput.classList.add('error')
//   }
// })

// socket.on('welcome', function (data) {
//   console.log(data);
//   addMessage(data, 'server')
// });

// socket.on('broadcast-message', (data) => {
//   console.log('broadcast message event')
//   addMessage(data, 'others')
// })

// // removes error class from input
// messageInput.addEventListener('keyup', (e) => {
//   messageInput.classList.remove('error')
// })

// function addMessage(data, type = false){
//   const messageElement = document.createElement('div')
//   messageElement.classList.add('message')

//   if(type === 'my'){
//     messageElement.classList.add('my-message')
//     messageElement.innerText = `${data.message}`

//   }else if(type === 'others'){
//     messageElement.classList.add('others-message')
//     messageElement.innerText = `${data.user}: ${data.message}`

//   }else{
//     messageElement.innerText = `${data.message}`

//   }
//   demoChatContainer.append(messageElement)
// }
