import { io } from "socket.io-client";
const socket = io("http://localhost:5001"); // Change URL after deployment
export default socket;
