import React from "react";

const OnlineUsersList = ({ users, onSelectUser }) => (
  <div className="card p-3">
    <h5>Online Users</h5>
    <ul className="list-group">
      {users.map((u, index) => (
        <li
          key={index}
          className="list-group-item d-flex justify-content-between"
          onClick={() => onSelectUser(u)}
          style={{ cursor: "pointer" }}
        >
          {u.username}
        </li>
      ))}
    </ul>
  </div>
);

export default OnlineUsersList;
