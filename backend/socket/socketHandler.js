import Message from "../models/Message.js";
import PrivateMessage from "../models/PrivateMessage.js";

const socketHandler = (io) => {
  const users = {}; // { socketId: { username, room } }

  io.on("connection", (socket) => {
    console.log("⚡ New connection:", socket.id);

    // ✅ Join Room
    socket.on("joinRoom", async ({ username, room }) => {
      if (!username || !room) return;
      users[socket.id] = { username, room };
      socket.join(room);
      console.log(`✅ ${username} joined room: ${room}`);

      // Fetch chat history for this room
      const history = await Message.find({ room }).sort({ timestamp: 1 });
      socket.emit("chatHistory", history);

      // Send online users list
      const onlineUsers = Object.entries(users).map(([id, user]) => ({
        socketId: id,
        username: user.username,
      }));
      io.to(room).emit("onlineUsers", onlineUsers);
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

    // ✅ Start Private Chat
    socket.on("startPrivateChat", async ({ sender, receiverSocketId }) => {
      const receiver = users[receiverSocketId];
      if (!receiver) return;

      // Fetch chat history between sender & receiver
      const history = await PrivateMessage.find({
        $or: [
          { sender: sender, receiver: receiver.username },
          { sender: receiver.username, receiver: sender },
        ],
      }).sort({ timestamp: 1 });

      socket.emit("privateChatHistory", { receiver: receiver.username, history });
    });

    // ✅ Private Message
    socket.on("privateMessage", async ({ sender, receiverSocketId, text }) => {
      const receiver = users[receiverSocketId];
      if (!receiver) return;

      const newPrivateMsg = new PrivateMessage({
        sender,
        receiver: receiver.username,
        text,
      });
      await newPrivateMsg.save();

      // Send to receiver only
      socket.to(receiverSocketId).emit("privateMessage", newPrivateMsg);
      // Send back to sender UI
      socket.emit("privateMessage", newPrivateMsg);
    });

    // ✅ Leave Room
    socket.on("leaveRoom", ({ room }) => {
      delete users[socket.id];
      socket.leave(room);
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

// Helper function
const updateOnlineUsers = (io, users, room) => {
  const onlineUsers = Object.entries(users).map(([id, user]) => ({
    socketId: id,
    username: user.username,
  }));
  io.to(room).emit("onlineUsers", onlineUsers);
};

export default socketHandler;
