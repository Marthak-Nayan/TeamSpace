// Project/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

// Detect environment
const dev = process.env.NODE_ENV !== "production";

// Frontend URL based on environment
const FRONTEND_URL = dev
  ? "http://localhost:3000" // Dev (Next.js local frontend)
  : "https://your-ngrok-or-prod-url.com"; // Prod (ngrok/deployment)

app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Join room
  socket.on("join-room", (roomID, username) => {
    socket.join(roomID);
    console.log(`📌 ${username} joined room: ${roomID}`);
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

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Socket server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
});


// Project/server.js
/*
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with your frontend URL in production
    methods: ["GET", "POST"],
    credentials: true,
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
*/