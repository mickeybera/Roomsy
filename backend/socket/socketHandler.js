import Message from "../models/Message.js";
import PrivateMessage from "../models/PrivateMessage.js";

const socketHandler = (io) => {
  const users = {}; // { socketId: { username, room } }

  io.on("connection", (socket) => {
    console.log("⚡ New connection:", socket.id);

    // ✅ Join Room
    socket.on("joinRoom", async ({ username, room }) => {
      if (!username || !room) return;

      // Leave previous room if exists
      if (users[socket.id]?.room) {
        socket.leave(users[socket.id].room);
      }

      // Update user data
      users[socket.id] = { username, room };
      socket.join(room);
      console.log(`✅ ${username} joined ${room}`);

      // Fetch room chat history
      const history = await Message.find({ room }).sort({ timestamp: 1 });
      socket.emit("chatHistory", history);

      updateOnlineUsers(io, users, room);
    });

    // ✅ Switch Room
    socket.on("switchRoom", async ({ newRoom }) => {
      const user = users[socket.id];
      if (!user) return;

      socket.leave(user.room);
      user.room = newRoom;
      socket.join(newRoom);

      // Fetch new room chat history
      const history = await Message.find({ room: newRoom }).sort({ timestamp: 1 });
      socket.emit("chatHistory", history);

      updateOnlineUsers(io, users, newRoom);
    });

    // ✅ Group Message
    socket.on("chatMessage", async (text) => {
      const user = users[socket.id];
      if (!user) return;
      const { username, room } = user;

      const newMsg = new Message({ username, room, text });
      await newMsg.save();

      io.to(room).emit("message", newMsg);
    });

    // ✅ Private Chat Request
    socket.on("startPrivateChat", async ({ sender, receiverSocketId }) => {
      const receiver = users[receiverSocketId];
      if (!receiver) return;

      const history = await PrivateMessage.find({
        $or: [
          { sender, receiver: receiver.username },
          { sender: receiver.username, receiver: sender }
        ]
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
        text
      });
      await newPrivateMsg.save();

      socket.to(receiverSocketId).emit("privateMessage", newPrivateMsg);
      socket.emit("privateMessage", newPrivateMsg);
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

const updateOnlineUsers = (io, users, room) => {
  const onlineUsers = Object.entries(users)
    .filter(([_, user]) => user.room === room)
    .map(([id, user]) => ({
      socketId: id,
      username: user.username
    }));
  io.to(room).emit("onlineUsers", onlineUsers);
};

export default socketHandler;
