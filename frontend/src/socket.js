import { io } from "socket.io-client";

const socket = io("https://roomsy-fzq9.vercel.app", {
  transports: ["websocket"], // ✅ Important for Vercel deployment
  withCredentials: true,
});

export default socket;

