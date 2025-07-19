import { io } from "socket.io-client";

const socket = io("https://roomsy.onrender.com", {
  transports: ["websocket"], // ✅ Important for Vercel deployment
  withCredentials: true,
});

export default socket;

