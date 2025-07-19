import React, { useState, useEffect, useRef } from "react";
import socket from "../socket";
import PrivateChatModal from "./PrivateChatModal";

const ChatRoom = ({ username, currentRoom }) => {
  const [room, setRoom] = useState(currentRoom);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [privateChatUser, setPrivateChatUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const chatEndRef = useRef(null);

  // ✅ Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    socket.emit("joinRoom", { username, room });

    socket.on("chatHistory", (history) => setMessages(history));
    socket.on("message", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("onlineUsers", (users) => setOnlineUsers(users));

    return () => {
      socket.off("chatHistory");
      socket.off("message");
      socket.off("onlineUsers");
    };
  }, [room, username]);

  const sendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("chatMessage", message);
      setMessage("");
    }
  };

  const switchRoom = (newRoom) => {
    if (newRoom !== room) {
      setRoom(newRoom);
      setMessages([]);
      socket.emit("switchRoom", { username, newRoom });
    }
  };

  const openPrivateChat = (user) => {
    setPrivateChatUser(user);
    setShowModal(true);
  };

  return (
    <div className="row mt-4">
      {/* Sidebar */}
      <div className="col-md-3">
        <h4>Rooms</h4>
        <ul className="list-group">
          {["General", "Technology", "Gaming", "Random", "Study"].map((r) => (
            <li
              key={r}
              className={`list-group-item ${room === r ? "active" : ""}`}
              onClick={() => switchRoom(r)}
              style={{ cursor: "pointer" }}
            >
              {r}
            </li>
          ))}
        </ul>

        <h4 className="mt-4">Online Users</h4>
        <ul className="list-group">
          {onlineUsers.map((user) => (
            <li
              key={user.socketId}
              className="list-group-item"
              onClick={() => openPrivateChat(user)}
              style={{ cursor: "pointer" }}
            >
              {user.username}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Area */}
      <div className="col-md-9">
        <div className="card">
          <div className="card-header">Room: {room}</div>
          <div
            className="card-body"
            style={{
              height: "400px",
              overflowY: "auto",
              backgroundColor: "#f8f9fa",
            }}
          >
            {messages.length > 0 ? (
              messages.map((msg, index) => {
                const isOwnMessage = msg.username === username;
                return (
                  <div
                    key={index}
                    className={`d-flex mb-2 ${
                      isOwnMessage ? "justify-content-end" : "justify-content-start"
                    }`}
                  >
                    <div
                      style={{
                        maxWidth: "70%",
                        padding: "10px 15px",
                        borderRadius: "15px",
                        backgroundColor: isOwnMessage ? "#0d6efd" : "#e9ecef",
                        color: isOwnMessage ? "#fff" : "#000",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                      }}
                    >
                      <strong>{isOwnMessage ? "You" : msg.username}</strong>
                      <div>{msg.text}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-muted">No messages yet...</p>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Message Input */}
          <div className="card-footer d-flex">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Type a message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <button className="btn btn-primary" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Private Chat Modal */}
      {showModal && (
        <PrivateChatModal
          show={showModal}
          onHide={() => setShowModal(false)}
          receiver={privateChatUser}
          socket={socket}
          sender={username}
        />
      )}
    </div>
  );
};

export default ChatRoom;
