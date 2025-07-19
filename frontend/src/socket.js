// import { io } from "socket.io-client";

// const socket = io("https://roomsy.onrender.com", {
//   transports: ["websocket"],
//   withCredentials: true,
// });

// export default socket;

import { io } from "socket.io-client";

const socket = io("https://roomsy.onrender.com", {
  transports: ["websocket"], // Important for deployment
  withCredentials: true,
});

export default socket;

