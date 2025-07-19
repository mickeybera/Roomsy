import React from "react";

const RoomSelector = ({ rooms, currentRoom, onSelect }) => (
  <div className="mb-3">
    <label className="form-label fw-bold">Select Room:</label>
    <select
      className="form-select"
      value={currentRoom}
      onChange={(e) => onSelect(e.target.value)}
    >
      {rooms.map((room, index) => (
        <option key={index} value={room}>
          {room}
        </option>
      ))}
    </select>
  </div>
);

export default RoomSelector;
