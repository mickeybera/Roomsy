import Message from "../models/Message.js";

const socketHandler = (io) => {
  const users = {}; // { socketId: { username, room } }

  io.on("connection", (socket) => {
    console.log(`⚡ New user connected: ${socket.id}`);

    // ✅ Join Room
    socket.on("joinRoom", async ({ username, room }) => {
      if (!username || !room) return;

      // Leave previous room if any
      if (users[socket.id]?.room) {
        socket.leave(users[socket.id].room);
      }

      users[socket.id] = { username, room };
      socket.join(room);
      console.log(`✅ ${username} joined ${room}`);

      // Send chat history for this room
      const history = await Message.find({ room }).sort({ timestamp: 1 });
      socket.emit("chatHistory", history);

      // Update online users for the room
      updateOnlineUsers(io, users, room);
    });

    // ✅ Group Chat Message
    socket.on("chatMessage", async (text) => {
      const user = users[socket.id];
      if (!user) return;

      const { username, room } = user;
      const newMessage = new Message({ username, room, text });
      await newMessage.save();

      io.to(room).emit("message", newMessage);
    });

    // ✅ Leave Room
    socket.on("leaveRoom", ({ room }) => {
      socket.leave(room);
      if (users[socket.id]) {
        users[socket.id].room = null;
      }
      updateOnlineUsers(io, users, room);
    });

    // ✅ Disconnect
    socket.on("disconnect", () => {
      const user = users[socket.id];
      if (user) {
        const { room } = user;
        delete users[socket.id];
        updateOnlineUsers(io, users, room);
      }
      console.log(`❌ Disconnected: ${socket.id}`);
    });
  });
};

// ✅ Helper: Update online users for a specific room
const updateOnlineUsers = (io, users, room) => {
  const onlineUsers = Object.entries(users)
    .filter(([id, user]) => user.room === room)
    .map(([id, user]) => ({
      socketId: id,
      username: user.username,
    }));

  io.to(room).emit("onlineUsers", onlineUsers);
};

export default socketHandler;
