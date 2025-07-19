import React, { useState, useEffect } from "react";
import axios from "axios";
import socket from "./socket";
import ChatRoom from "./components/ChatRoom";

const App = () => {
  const [username, setUsername] = useState("");
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    // ✅ Fetch rooms from your Render backend
    axios
      .get("https://roomsy.onrender.com/api/rooms") // ✅ Correct endpoint
      .then((res) => {
        console.log("Rooms fetched:", res.data);
        setRooms(res.data);
      })
      .catch((err) => console.error("Error fetching rooms:", err));
  }, []);

  const joinRoom = () => {
    if (username.trim() && selectedRoom) {
      socket.emit("joinRoom", { username, room: selectedRoom });
      setJoined(true);
    } else {
      alert("Please enter username and select a room.");
    }
  };

  return (
    <div className="container mt-4">
      {!joined ? (
        <div className="card p-4 shadow-sm" style={{ maxWidth: "400px", margin: "auto" }}>
          <h2 className="text-center mb-4">Join Chat</h2>
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <select
            className="form-select mb-3"
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
          >
            <option value="">Select Room</option>
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <option key={room._id} value={room.name}>
                  {room.name}
                </option>
              ))
            ) : (
              <option disabled>Loading rooms...</option>
            )}
          </select>
          <button className="btn btn-primary w-100" onClick={joinRoom}>
            Join
          </button>
        </div>
      ) : (
        <ChatRoom username={username} currentRoom={selectedRoom} />
      )}
    </div>
  );
};

export default App;
