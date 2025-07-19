import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const PrivateChatModal = ({ show, onHide, receiver, socket, sender }) => {
  const [privateMessages, setPrivateMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (show && receiver) {
      socket.emit("startPrivateChat", { sender, receiverSocketId: receiver.socketId });

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
    }
  }, [show, receiver, sender, socket]);

  const sendPrivateMessage = () => {
    if (message.trim() !== "") {
      socket.emit("privateMessage", {
        sender,
        receiverSocketId: receiver.socketId,
        text: message,
      });
      setMessage("");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Chat with {receiver?.username}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "300px", overflowY: "auto" }}>
        {privateMessages.map((msg, index) => (
          <div
            key={index}
            style={{
              background: msg.sender === sender ? "#00ff1eff" : "#f1f1f1",
              color: msg.sender === sender ? "#fff" : "#000",
              padding: "8px",
              borderRadius: "8px",
              marginBottom: "6px",
              textAlign: msg.sender === sender ? "right" : "left",
            }}
          >
            {msg.text}
            <br />
            <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
          </div>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Form.Control
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendPrivateMessage()}
        />
        <Button variant="primary" onClick={sendPrivateMessage}>Send</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PrivateChatModal;
