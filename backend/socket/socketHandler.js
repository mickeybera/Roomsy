import Message from "../models/Message.js";
import PrivateMessage from "../models/PrivateMessage.js";
import User from "../models/User.js"; // ✅ Import User model

const socketHandler = (io) => {
  const users = {}; // In-memory users: { socketId: { username, room } }

  io.on("connection", (socket) => {
    console.log("⚡ New connection:", socket.id);

    // ✅ Join Room
    socket.on("joinRoom", async ({ username, room }) => {
      if (!username || !room) return;

      users[socket.id] = { username, room };
      socket.join(room);
      console.log(`✅ ${username} joined ${room}`);

      // ✅ Save user in DB (upsert)
      await User.findOneAndUpdate(
        { username },
        { username, socketId: socket.id, room },
        { upsert: true, new: true }
      );

      // Send previous messages
      const history = await Message.find({ room }).sort({ timestamp: 1 });
      socket.emit("chatHistory", history);

      updateOnlineUsers(io, users, room);
    });

    // ✅ Switch Room
    socket.on("switchRoom", async ({ username, newRoom }) => {
      const user = users[socket.id];
      if (!user) return;

      const oldRoom = user.room;

      socket.leave(oldRoom);
      user.room = newRoom;
      socket.join(newRoom);

      console.log(`🔄 ${username} switched from ${oldRoom} to ${newRoom}`);

      // ✅ Update user in DB
      await User.findOneAndUpdate({ username }, { room: newRoom });

      updateOnlineUsers(io, users, oldRoom);
      updateOnlineUsers(io, users, newRoom);

      const history = await Message.find({ room: newRoom }).sort({ timestamp: 1 });
      socket.emit("chatHistory", history);
    });

    // ✅ Group Chat Message
    socket.on("chatMessage", async (text) => {
      const user = users[socket.id];
      if (!user) return;

      const newMessage = new Message({ username: user.username, room: user.room, text });
      await newMessage.save();

      io.to(user.room).emit("message", newMessage);
    });

    // ✅ Private Chat Start
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

      socket.to(receiverSocketId).emit("privateMessage", newPrivateMsg);
      socket.emit("privateMessage", newPrivateMsg);
    });

    // ✅ Disconnect
    socket.on("disconnect", async () => {
      const user = users[socket.id];
      if (user) {
        const { room, username } = user;

        // ✅ Remove user from DB
        await User.findOneAndDelete({ username });

        delete users[socket.id];
        updateOnlineUsers(io, users, room);
      }
      console.log(`❌ Disconnected: ${socket.id}`);
    });
  });
};

// ✅ Helper: Update online users
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

