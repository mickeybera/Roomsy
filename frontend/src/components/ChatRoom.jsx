import React, { useState, useEffect } from "react";
import socket from "../socket";

const ChatRoom = ({ username, currentRoom, rooms, switchRoom }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    socket.on("chatHistory", (history) => setMessages(history));
    socket.on("message", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("onlineUsers", (users) => setOnlineUsers(users));

    return () => {
      socket.off("chatHistory");
      socket.off("message");
      socket.off("onlineUsers");
    };
  }, [currentRoom]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("chatMessage", message);
      setMessage("");
    }
  };

  return (
    <div className="row">
      <div className="col-md-8">
        <div
          className="card shadow-sm p-3"
          style={{ height: "70vh", backgroundColor: "#f9f9f9" }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h4>{currentRoom} Room</h4>
            <select
              className="form-select"
              style={{ width: "200px" }}
              value={currentRoom}
              onChange={(e) => switchRoom(e.target.value)}
            >
              {rooms.map((room) => (
                <option key={room._id} value={room.name}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              background: "#fff",
              borderRadius: "10px",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor:
                    msg.username === username ? "#007bff" : "#e4e6eb",
                  color: msg.username === username ? "#fff" : "#000",
                  padding: "10px",
                  margin: "5px 0",
                  borderRadius: "8px",
                  maxWidth: "60%",
                  alignSelf:
                    msg.username === username ? "flex-end" : "flex-start",
                }}
              >
                <strong>{msg.username}</strong>: {msg.text}
              </div>
            ))}
          </div>
          <div className="d-flex">
            <input
              type="text"
              className="form-control"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button className="btn btn-primary ms-2" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card p-3 shadow-sm" style={{ height: "70vh" }}>
          <h5>Online Users</h5>
          <ul>
            {onlineUsers.map((user, idx) => (
              <li key={idx}>{user.username}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
