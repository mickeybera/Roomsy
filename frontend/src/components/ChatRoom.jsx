import React, { useEffect, useState } from "react";
import socket from "../socket";
import PrivateChatModal from "./PrivateChatModal";

const ChatRoom = ({ username, currentRoom }) => {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
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
    if (message.trim() !== "") {
      socket.emit("chatMessage", message);
      setMessage("");
    }
  };

  const openPrivateChat = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  return (
    <div className="row mt-4">
      {/* Chat Section */}
      <div className="col-md-8">
        <div className="card shadow-sm" style={{ height: "500px", display: "flex", flexDirection: "column" }}>
          <div className="card-header">Room: {currentRoom}</div>
          <div className="card-body" style={{ overflowY: "auto", flex: 1 }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: msg.username === username ? "#007bff" : "#f1f1f1",
                  color: msg.username === username ? "#fff" : "#000",
                  textAlign: msg.username === username ? "right" : "left",
                  padding: "8px",
                  borderRadius: "8px",
                  marginBottom: "6px",
                  maxWidth: "70%",
                  marginLeft: msg.username === username ? "auto" : "0"
                }}
              >
                <strong>{msg.username}</strong>: {msg.text}
                <br />
                <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
              </div>
            ))}
          </div>
          <div className="card-footer d-flex">
            <input
              type="text"
              className="form-control me-2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message"
            />
            <button className="btn btn-primary" onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>

      {/* Online Users */}
      <div className="col-md-4">
        <div className="card shadow-sm" style={{ height: "500px" }}>
          <div className="card-header">Online Users</div>
          <ul className="list-group list-group-flush" style={{ overflowY: "auto", flex: 1 }}>
            {onlineUsers.map((user) => (
              <li
                key={user.socketId}
                className="list-group-item"
                style={{ cursor: "pointer" }}
                onClick={() => openPrivateChat(user)}
              >
                {user.username}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Private Chat Modal */}
      <PrivateChatModal
        show={showModal}
        onHide={() => setShowModal(false)}
        receiver={selectedUser}
        socket={socket}
        sender={username}
      />
    </div>
  );
};

export default ChatRoom;
