import React, { useState, useEffect } from "react";
import socket from "../socket";
import PrivateChatModal from "./PrivateChatModal";

const ChatRoom = ({ username, currentRoom }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [privateMessages, setPrivateMessages] = useState({}); // {username: [msgs]}

  useEffect(() => {
    // ✅ Join the new room
    socket.emit("joinRoom", { username, room: currentRoom });

    // ✅ Listen for room chat history
    socket.on("chatHistory", (history) => {
      setMessages(history);
    });

    // ✅ Listen for new messages
    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // ✅ Online users update
    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    // ✅ Private Chat History
    socket.on("privateChatHistory", ({ receiver, history }) => {
      setPrivateMessages((prev) => ({
        ...prev,
        [receiver]: history,
      }));
      setShowModal(true);
    });

    // ✅ New Private Message
    socket.on("privateMessage", (msg) => {
      const userKey =
        msg.sender === username ? msg.receiver : msg.sender;
      setPrivateMessages((prev) => ({
        ...prev,
        [userKey]: [...(prev[userKey] || []), msg],
      }));
    });

    return () => {
      socket.off("chatHistory");
      socket.off("message");
      socket.off("onlineUsers");
      socket.off("privateChatHistory");
      socket.off("privateMessage");
    };
  }, [currentRoom, username]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("chatMessage", message);
      setMessage("");
    }
  };

  const openPrivateChat = (user) => {
    setSelectedUser(user);
    socket.emit("startPrivateChat", {
      sender: username,
      receiverSocketId: user.socketId,
    });
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Chat Section */}
        <div className="col-md-8">
          <div
            className="card shadow-sm"
            style={{
              height: "70vh",
              display: "flex",
              flexDirection: "column",
              background: "#f8f9fa",
            }}
          >
            <div className="card-header bg-primary text-white">
              Room: {currentRoom}
            </div>
            <div
              className="card-body"
              style={{ overflowY: "auto", flex: 1 }}
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 mb-2 rounded ${
                    msg.username === username
                      ? "bg-primary text-white text-end"
                      : "bg-light text-dark"
                  }`}
                  style={{ maxWidth: "60%", marginLeft: msg.username === username ? "auto" : "0" }}
                >
                  <strong>{msg.username}:</strong> {msg.text}
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="card-footer d-flex">
              <input
                type="text"
                className="form-control"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              />
              <button className="btn btn-primary ms-2" onClick={sendMessage}>
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Online Users */}
        <div className="col-md-4">
          <div className="card shadow-sm" style={{ height: "70vh" }}>
            <div className="card-header bg-success text-white">
              Online Users
            </div>
            <ul className="list-group list-group-flush">
              {onlineUsers.map((user) =>
                user.username !== username ? (
                  <li
                    key={user.socketId}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    {user.username}
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => openPrivateChat(user)}
                    >
                      Chat
                    </button>
                  </li>
                ) : null
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Private Chat Modal */}
      {showModal && selectedUser && (
        <PrivateChatModal
          show={showModal}
          onHide={() => setShowModal(false)}
          sender={username}
          receiver={selectedUser.username}
          receiverSocketId={selectedUser.socketId}
          privateMessages={privateMessages[selectedUser.username] || []}
        />
      )}
    </div>
  );
};

export default ChatRoom;
