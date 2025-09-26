import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from './routes/authRoutes.js'
import messageRoutes from './routes/messageRoutes.js';
import { Server } from "socket.io";
import Message from './models/Message.js';
import http from 'http';

dotenv.config();
const app = express();
const server = http.createServer(app);

const onlineUsers = new Map();

const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.CLIENT_URL || "https://chat-app-sayz.vercel.app",
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

app.use('/api/auth',authRoutes);
app.use('/api/messages',messageRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Chat App API!");
});



const io = new Server(server,{
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
})

io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);
  
    socket.on("addUser", (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
      console.log("Online users:", Array.from(onlineUsers.keys()));
    });
    
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });
  
    
    socket.on("send_message", async (data) => {
      const { senderId, receiverId, text } = data;
  
      try {
        const newMessage = new Message({ senderId, receiverId, text });
        await newMessage.save();
    
        // Emit the message to the receiver's room
        io.to(receiverId).emit("receive_message", newMessage);
        // Also emit the message back to the sender's room
        io.to(senderId).emit("receive_message", newMessage);
      } catch (error) {
        console.error("Error saving or emitting message:", error);
        // Optionally, emit an error back to the sender
        socket.emit("message_error", "Failed to send message.");
      }
    });
  
    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
      onlineUsers.forEach((value, key) => {
        if (value === socket.id) {
          onlineUsers.delete(key);
        }
      });
      io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
      console.log("Online users after disconnect:", Array.from(onlineUsers.keys()));
    });
  });



mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    server.listen(PORT,()=>{
        console.log(`Server is running on port number ${PORT}`)
    })
})
.catch((err) => console.error(err))