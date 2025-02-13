const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 3000 });

const users = new Map(); // Store sockets and their nicknames

server.on("connection", (socket) => {
  console.log("New user connected");

  socket.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      // If user is setting their nickname
      if (data.type === "set_nickname") {
        users.set(socket, data.nickname);
        console.log(`User set nickname: ${data.nickname}`);
        return; // Don't broadcast this message
      }

      // If user is sending a message
      if (data.type === "message") {
        const nickname = users.get(socket) || "Anonymous"; // Default to Anonymous if no nickname set
        const formattedMessage = `${nickname}: ${data.message}`;

        // Broadcast only chat messages
        server.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(formattedMessage);
          }
        });
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  socket.on("close", () => {
    console.log("User disconnected");
    users.delete(socket);
  });
});

console.log("WebSocket server running on ws://localhost:3000");
