import React, { useState, useEffect } from "react";

const PrivateChatModal = ({ show, onHide, receiver, sender, socket }) => {
  const [privateMessages, setPrivateMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (receiver) {
      socket.emit("startPrivateChat", { sender, receiverSocketId: receiver.socketId });
    }

    socket.on("privateChatHistory", ({ history }) => {
      setPrivateMessages(history);
    });

    socket.on("privateMessage", (msg) => {
      setPrivateMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("privateChatHistory");
      socket.off("privateMessage");
    };
  }, [receiver]);

  const sendPrivateMessage = () => {
    if (text.trim()) {
      socket.emit("privateMessage", {
        sender,
        receiverSocketId: receiver.socketId,
        text,
      });
      setText("");
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Chat with {receiver.username}</h5>
            <button className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body" style={{ height: "250px", overflowY: "auto" }}>
            {privateMessages.map((msg, index) => (
              <div key={index}>
                <strong>{msg.sender}:</strong> {msg.text}
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <input
              type="text"
              className="form-control"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a private message"
            />
            <button className="btn btn-primary" onClick={sendPrivateMessage}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateChatModal;
