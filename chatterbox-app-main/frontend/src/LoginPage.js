import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');

  const handleLogin = () => {
    if (username.trim() && room.trim()) {
      onLogin(username, room);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1 className="title">ChatterBox 🚀</h1>
        <p className="subtitle">Connect to the world, one room at a time.</p>
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter room name"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <button onClick={handleLogin}>Join Chat</button>
      </div>
    </div>
  );
}

export default LoginPage;