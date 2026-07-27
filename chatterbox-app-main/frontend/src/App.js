import React, { useState } from 'react';
import LoginPage from './LoginPage';
import ChatPage from './ChatPage';

function App() {
  const [user, setUser] = useState(null); // { username, room }

  const handleLogin = (username, room) => {
    setUser({ username, room });
  };

  return (
    <div className="App">
      {!user ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <ChatPage username={user.username} room={user.room} />
      )}
    </div>
  );
}

export default App;