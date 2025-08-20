const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"]
  }
});

// Store active users
const users = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // User registration
  socket.on('register', (username) => {
    // Check if username is already taken
    if ([...users.values()].some(user => user.username === username)) {
      socket.emit('username_error', 'Username already taken');
      return;
    }

    // Store user information
    users.set(socket.id, {
      id: socket.id,
      username: username,
      online: true
    });

    // Broadcast new user to all clients
    io.emit('user_list', Array.from(users.values()));
    socket.emit('registration_success', { id: socket.id, username });
  });

  // Send message
  socket.on('chat message', (messageData) => {
    const user = users.get(socket.id);
    if (!user) return;

    const fullMessage = {
      ...messageData,
      sender: user.username,
      senderId: socket.id,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    // Broadcast message to all users or specific room
    if (messageData.roomId) {
      socket.to(messageData.roomId).emit('chat message', fullMessage);
    } else {
      io.emit('chat message', fullMessage);
    }
  });

  // Join a chat room
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    socket.emit('room_joined', roomId);
  });

  // Handle message read receipts
  socket.on('message_read', (messageId) => {
    io.emit('message_read_receipt', {
      messageId,
      readBy: socket.id
    });
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      users.delete(socket.id);
      io.emit('user_list', Array.from(users.values()));
      console.log(`User ${user.username} disconnected`);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
