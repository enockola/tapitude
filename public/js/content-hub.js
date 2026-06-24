// Connect to your Express server (ensure the URL matches your server address)
const socket = io("http://localhost:3000/content-hub");

// Listen for the connection confirmation
socket.on("connect", () => {
  console.log("Connected to server with ID:", socket.id);
});

// Send a message to the server
socket.emit("chat message", "Hello from the client!");

// Listen for messages from the server
socket.on("chat message", (msg) => {
  console.log("Received message:", msg);
});