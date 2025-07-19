import React, { useEffect, useState } from "react";
import socket from "../socket";
import PrivateChatModal from "./PrivateChatModal";

const ChatRoom = ({ username, currentRoom, rooms }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [privateModalOpen, setPrivateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    socket.on("chatHistory", (history) => setMessages(history));
    socket.on("message", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("onlineUsers", (users) => setOnlineUsers(users));

    return () => {
      socket.off("chatHistory");
      socket.off("message");
      socket.off("onlineUsers");
    };
  }, []);

  const sendMessage = () => {
    if (text.trim()) {
      socket.emit("chatMessage", text);
      setText("");
    }
  };

  const switchRoom = (newRoom) => {
    socket.emit("switchRoom", { newRoom });
    setMessages([]);
  };

  const startPrivateChat = (user) => {
    setSelectedUser(user);
    setPrivateModalOpen(true);
  };

  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-between mb-3">
        <h3>Room: {currentRoom}</h3>
        <select
          className="form-select w-auto"
          onChange={(e) => switchRoom(e.target.value)}
        >
          {rooms.map((room) => (
            <option key={room._id} value={room.name}>
              {room.name}
            </option>
          ))}
        </select>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="border p-3 mb-3" style={{ height: "300px", overflowY: "auto" }}>
            {messages.map((msg, index) => (
              <div key={index}>
                <strong>{msg.username}:</strong> {msg.text}
              </div>
            ))}
          </div>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message"
            />
            <button className="btn btn-primary" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
        <div className="col-md-4">
          <h5>Online Users</h5>
          <ul className="list-group">
            {onlineUsers.map((user) => (
              <li
                key={user.socketId}
                className="list-group-item d-flex justify-content-between"
              >
                {user.username}
                {user.username !== username && (
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => startPrivateChat(user)}
                  >
                    Chat
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {privateModalOpen && (
        <PrivateChatModal
          show={privateModalOpen}
          onHide={() => setPrivateModalOpen(false)}
          receiver={selectedUser}
          sender={username}
          socket={socket}
        />
      )}
    </div>
  );
};

export default ChatRoom;
