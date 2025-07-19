import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import socket from "../socket";

const PrivateChatModal = ({
  show,
  onHide,
  sender,
  receiver,
  receiverSocketId,
  privateMessages,
}) => {
  const [text, setText] = useState("");

  const sendPrivateMessage = () => {
    if (text.trim()) {
      socket.emit("privateMessage", {
        sender,
        receiverSocketId,
        text,
      });
      setText("");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Chat with {receiver}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
        {privateMessages.length > 0 ? (
          privateMessages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 mb-2 rounded ${
                msg.sender === sender
                  ? "bg-primary text-white text-end"
                  : "bg-light text-dark"
              }`}
              style={{ maxWidth: "70%", marginLeft: msg.sender === sender ? "auto" : "0" }}
            >
              <strong>{msg.sender}:</strong> {msg.text}
              <div style={{ fontSize: "12px", color: "#666" }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        ) : (
          <p>No messages yet.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Form.Control
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendPrivateMessage()}
        />
        <Button variant="primary" onClick={sendPrivateMessage}>
          Send
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PrivateChatModal;
