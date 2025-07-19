import Message from "../models/Message.js";
import PrivateMessage from "../models/PrivateMessage.js";

const users = {}; // { socketId: { username, room } }

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ New connection:", socket.id);

    // ✅ Join Room
    socket.on("joinRoom", async ({ username, room }) => {
      if (!username || !room) return;

      // If user was in a previous room, leave it
      if (users[socket.id]?.room) {
        socket.leave(users[socket.id].room);
      }

      users[socket.id] = { username, room };
      socket.join(room);
      console.log(`✅ ${username} joined room: ${room}`);

      // Send chat history for the room
      const history = await Message.find({ room }).sort({ timestamp: 1 });
      socket.emit("chatHistory", history);

      updateOnlineUsers(io, room);
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

    // ✅ Start Private Chat (Send History)
    socket.on("startPrivateChat", async ({ sender, receiverSocketId }) => {
      const receiver = users[receiverSocketId];
      if (!receiver) return;

      const history = await PrivateMessage.find({
        $or: [
          { sender, receiver: receiver.username },
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

      // Send to both users
      socket.to(receiverSocketId).emit("privateMessage", newPrivateMsg);
      socket.emit("privateMessage", newPrivateMsg);
    });

    // ✅ Leave Room
    socket.on("leaveRoom", ({ room }) => {
      socket.leave(room);
      if (users[socket.id]) {
        users[socket.id].room = null;
      }
      updateOnlineUsers(io, room);
    });

    // ✅ Disconnect
    socket.on("disconnect", () => {
      const user = users[socket.id];
      if (user) {
        const { room } = user;
        delete users[socket.id];
        updateOnlineUsers(io, room);
      }
      console.log(`❌ Disconnected: ${socket.id}`);
    });
  });
};

const updateOnlineUsers = (io, room) => {
  const onlineUsers = Object.entries(users)
    .filter(([_, user]) => user.room === room)
    .map(([id, user]) => ({
      socketId: id,
      username: user.username,
    }));
  io.to(room).emit("onlineUsers", onlineUsers);
};

export default socketHandler;
