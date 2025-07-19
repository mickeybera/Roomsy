import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const PrivateChatModal = ({ show, onHide, receiver, socket, sender }) => {
  const [message, setMessage] = useState("");
  const [privateMessages, setPrivateMessages] = useState([]);
  const chatEndRef = useRef(null);

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

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [privateMessages]);

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
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Private Chat with {receiver?.username}</Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{
          maxHeight: "400px",
          overflowY: "auto",
          backgroundColor: "#f0f2f5",
          padding: "15px",
          borderRadius: "8px",
        }}
      >
        {privateMessages.map((msg, index) => {
          const isOwnMessage = msg.sender === sender;
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
                  fontSize: "14px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              >
                <strong>{isOwnMessage ? "You" : msg.sender}</strong>
                <div>{msg.text}</div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </Modal.Body>
      <Modal.Footer className="d-flex">
        <Form.Control
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendPrivateMessage()}
          style={{ marginRight: "10px" }}
        />
        <Button variant="primary" onClick={sendPrivateMessage}>
          Send
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PrivateChatModal;
