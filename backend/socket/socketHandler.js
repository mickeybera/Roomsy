import Message from "../models/Message.js";
import PrivateMessage from "../models/PrivateMessage.js";

const socketHandler = (io) => {
  const users = {}; // { socketId: { username, room } }

  io.on("connection", (socket) => {
    console.log("⚡ New user connected:", socket.id);

    // ✅ Join Room
    socket.on("joinRoom", async ({ username, room }) => {
      if (!username || !room) return;

      // If already in a room, leave the previous one
      if (users[socket.id]?.room) {
        socket.leave(users[socket.id].room);
        updateOnlineUsers(io, users, users[socket.id].room);
      }

      users[socket.id] = { username, room };
      socket.join(room);

      console.log(`✅ ${username} joined ${room}`);

      // Fetch chat history for the room
      const history = await Message.find({ room }).sort({ timestamp: 1 });
      socket.emit("chatHistory", history);

      updateOnlineUsers(io, users, room);
    });

    // ✅ Send Group Message
    socket.on("chatMessage", async (text) => {
      const user = users[socket.id];
      if (!user) return;
      const { username, room } = user;

      const newMessage = new Message({ username, room, text });
      await newMessage.save();

      io.to(room).emit("message", newMessage);
    });

    // ✅ Start Private Chat - Fetch history
    socket.on("startPrivateChat", async ({ sender, receiverSocketId }) => {
      const receiver = users[receiverSocketId];
      if (!receiver) return;

      const history = await PrivateMessage.find({
        $or: [
          { sender, receiver: receiver.username },
          { sender: receiver.username, receiver: sender },
        ],
      }).sort({ timestamp: 1 });

      socket.emit("privateChatHistory", {
        receiver: receiver.username,
        receiverSocketId,
        history,
      });
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

      socket.to(receiverSocketId).emit("privateMessage", newPrivateMsg);
      socket.emit("privateMessage", newPrivateMsg);
    });

    // ✅ Leave Room
    socket.on("leaveRoom", ({ room }) => {
      socket.leave(room);
      delete users[socket.id];
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
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });
};

// Helper: Update Online Users for a Room
const updateOnlineUsers = (io, users, room) => {
  const onlineUsers = Object.entries(users)
    .filter(([_, user]) => user.room === room)
    .map(([id, user]) => ({
      socketId: id,
      username: user.username,
    }));

  io.to(room).emit("onlineUsers", onlineUsers);
};

export default socketHandler;
