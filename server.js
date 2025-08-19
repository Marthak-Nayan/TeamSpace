// Project/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Replace with your frontend URL in production
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Join room
  socket.on("join-room", (roomID, username) => {
    socket.join(roomID);
    console.log(`📌 ${username} joined room: ${roomID}`);

    // Notify others in the room
   // socket.to(roomID).emit("user-joined", username);
  });

  // Receive a message and broadcast to the same room
  socket.on("user-message", (msg) => {
    console.log(`💬 Message in room ${msg.organizationId}:`, msg.mess);
    socket.to(msg.organizationId).emit("chat-message", msg);
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`🚀 Socket server running on port ${PORT}`);
});
