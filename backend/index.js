import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { Server } from "socket.io";
import http from "http";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import socketHandler from "./socket/socketHandler.js";
import Room from "./models/Room.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ CORS for Express
const allowedOrigins = [
  "http://localhost:5173",           // Local Dev
  "https://your-vercel-app.vercel.app" // ✅ Replace with your Vercel frontend URL
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

// ✅ Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket", "polling"] // ✅ Important for Render
});

socketHandler(io);

// ✅ MongoDB + Default Rooms
mongoose
  .connect(process.env.MONGO_URI, {
    
  })
  .then(async () => {
    console.log("✅ MongoDB Connected");

    // ✅ Insert default rooms if none exist
    const count = await Room.countDocuments();
    if (count === 0) {
      await Room.insertMany([
        { name: "General" },
        { name: "Technology" },
        { name: "Gaming" },
        { name: "Random" },
        { name: "Study" }
      ]);
      console.log("✅ Default rooms inserted into DB");
    }
  })
  .catch((err) => console.error("❌ DB Error:", err));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/rooms", roomRoutes);

// ✅ Test Route
app.get("/", (req, res) => res.send("✅ API Running"));

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
