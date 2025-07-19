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

// ✅ Socket.IO
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});
socketHandler(io);

// Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB + Default Rooms
mongoose
  .connect(process.env.MONGO_URI)
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
        {name:"Study"}
      ]);
      console.log("✅ Default rooms inserted into DB");
    }
  })
  .catch((err) => console.error("❌ DB Error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/rooms", roomRoutes);

app.get("/", (req, res) => res.send("API Running"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
