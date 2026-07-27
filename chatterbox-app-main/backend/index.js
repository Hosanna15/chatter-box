import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import Message from './models/Message.js';

// --- Basic Server Setup ---
const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

// --- Database Connection ---
// THIS LINE IS NOW CORRECTED (wrapped in quotes and added a database name)
const MONGO_URI = "mongodb+srv://jayaram:Ram568506@cluster0.92lwt.mongodb.net/chatterbox?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

const users = {}; // Stores online users: { socketId: { username, room } }

// --- Real-Time Logic ---
io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  socket.on('joinRoom', async ({ username, room }) => {
    socket.join(room);
    users[socket.id] = { username, room };

    // Fetch last 50 messages from the database for the new user
    const lastMessages = await Message.find({ room }).sort({ createdAt: -1 }).limit(50);
    socket.emit('lastMessages', lastMessages.reverse());

    // Broadcast that a new user has joined
    socket.to(room).emit('receiveMessage', {
      message: `${username} has joined the chat!`,
      username: 'System',
      isSystemMessage: true,
    });

    // Update user list for everyone in the room
    const usersInRoom = Object.values(users).filter(user => user.room === room);
    io.to(room).emit('updateUserList', usersInRoom);
  });

  socket.on('sendMessage', async (data) => {
    // Save message to database
    const newMessage = new Message({
      room: data.room,
      username: data.username,
      message: data.message,
    });
    await newMessage.save();

    // Broadcast message to other users
    socket.to(data.room).emit('receiveMessage', {
      message: data.message,
      username: data.username,
    });
  });

  socket.on('disconnect', () => {
    const disconnectedUser = users[socket.id];
    if (disconnectedUser) {
      const { username, room } = disconnectedUser;
      delete users[socket.id];

      // Broadcast that a user has left
      io.to(room).emit('receiveMessage', {
        message: `${username} has left the chat.`,
        username: 'System',
        isSystemMessage: true,
      });

      // Update user list
      const usersInRoom = Object.values(users).filter(user => user.room === room);
      io.to(room).emit('updateUserList', usersInRoom);
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});