import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const PrivateChatModal = ({ show, onHide, receiver, socket, sender }) => {
  const [message, setMessage] = useState("");
  const [privateMessages, setPrivateMessages] = useState([]);

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
  }, [show, receiver, socket, sender]);

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
          <div key={index}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Form.Control
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button variant="primary" onClick={sendPrivateMessage}>
          Send
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PrivateChatModal;
