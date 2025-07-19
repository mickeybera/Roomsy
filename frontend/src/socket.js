import { io } from "socket.io-client";

const socket = io("https://roomsy.onrender.com", {
  transports: ["websocket"],
  withCredentials: true,
});

export default socket;


