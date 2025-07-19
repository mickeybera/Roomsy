import React, { useState, useEffect } from "react";
import socket from "../socket";
import PrivateChatModal from "./PrivateChatModal";

const ChatRoom = ({ username, currentRoom }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [privateChatUser, setPrivateChatUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  const switchRoom = (room) => {
    if (room !== currentRoom) {
      socket.emit("switchRoom", { username, newRoom: room });
    }
  };

  const openPrivateChat = (user) => {
    setPrivateChatUser(user);
    setShowModal(true);
  };

  return (
    <div className="row mt-4">
      <div className="col-md-3">
        <h4>Rooms</h4>
        <ul className="list-group">
          {["General", "Technology", "Gaming", "Random", "Study"].map((room) => (
            <li
              key={room}
              className={`list-group-item ${currentRoom === room ? "active" : ""}`}
              onClick={() => switchRoom(room)}
              style={{ cursor: "pointer" }}
            >
              {room}
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

      <div className="col-md-9">
        <div className="card">
          <div className="card-header">Room: {currentRoom}</div>
          <div
            className="card-body"
            style={{ height: "400px", overflowY: "auto" }}
          >
            {messages.map((msg, index) => (
              <div key={index}>
                <strong>{msg.username}:</strong> {msg.text}
              </div>
            ))}
          </div>
          <div className="card-footer d-flex">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Type a message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className="btn btn-primary" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      </div>

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
