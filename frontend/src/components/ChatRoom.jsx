import React, { useState, useEffect } from "react";
import socket from "../socket";
import PrivateChatModal from "./PrivateChatModal";

const ChatRoom = ({ username, currentRoom }) => {
  const [room, setRoom] = useState(currentRoom);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [privateChatUser, setPrivateChatUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // ✅ Initial Join for default/current room
    socket.emit("joinRoom", { username, room });

    // ✅ Listeners
    socket.on("chatHistory", (history) => setMessages(history));
    socket.on("message", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("onlineUsers", (users) => setOnlineUsers(users));

    return () => {
      socket.off("chatHistory");
      socket.off("message");
      socket.off("onlineUsers");
    };
  }, [room, username]); // ✅ Re-run when room changes

  const sendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("chatMessage", message);
      setMessage("");
    }
  };

  const switchRoom = (newRoom) => {
    if (newRoom !== room) {
      setRoom(newRoom); // ✅ Update local state
      setMessages([]); // ✅ Clear old messages
      socket.emit("switchRoom", { username, newRoom });
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

      <div className="col-md-9">
        <div className="card">
          <div className="card-header">Room: {room}</div>
          <div
            className="card-body"
            style={{ height: "400px", overflowY: "auto" }}
          >
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div key={index}>
                  <strong>{msg.username}:</strong> {msg.text}
                </div>
              ))
            ) : (
              <p className="text-muted">No messages yet...</p>
            )}
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

