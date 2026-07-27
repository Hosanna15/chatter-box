import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Avatar from 'react-avatar';
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';
import './ChatPage.css';

const socket = io('https://chatterbox-app-ro8d.onrender.com');

function ChatPage({ username, room }) {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatBodyRef = useRef(null);

  useEffect(() => {
    // Join the chat room on component mount
    socket.emit('joinRoom', { username, room });

    // Listen for the last messages sent in the room
    socket.on('lastMessages', (messages) => {
      setChat(messages.map(msg => ({ ...msg, type: msg.username === username ? 'sent' : 'received' })));
    });

    socket.on('receiveMessage', (data) => {
      setChat((prev) => [...prev, { ...data, type: 'received' }]);
    });

    socket.on('updateUserList', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off('lastMessages');
      socket.off('receiveMessage');
      socket.off('updateUserList');
    };
  }, [username, room]);

  useEffect(() => {
    // Auto-scroll to the latest message
    chatBodyRef.current?.scrollTo(0, chatBodyRef.current.scrollHeight);
  }, [chat]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const messageData = { room, username, message };
      socket.emit('sendMessage', messageData);
      setChat((prev) => [...prev, { ...messageData, type: 'sent' }]);
      setMessage('');
      setShowEmojiPicker(false);
    }
  };

  const onEmojiClick = (emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
  };

  return (
    <div className="chat-app-container">
      <div className="sidebar">
        <h3>Online Users ({onlineUsers.length})</h3>
        <ul>
          {onlineUsers.map((user) => (
            <li key={user.username}>
              <Avatar name={user.username} size="30" round={true} />
              <span>{user.username}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-window">
        <div className="chat-header">
          <h2>Room: {room}</h2>
        </div>
        <div className="chat-body" ref={chatBodyRef}>
          <AnimatePresence>
            {chat.map((msg, index) => (
              <motion.div
                key={index}
                className={`message-container ${msg.username === 'System' ? 'system' : msg.type}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {msg.username !== 'System' && msg.type === 'received' && <Avatar name={msg.username} size="40" round={true} />}
                <div className="message">
                  {msg.username !== 'System' && msg.type === 'received' && <div className="message-sender">{msg.username}</div>}
                  <div className="message-content">{msg.message}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {showEmojiPicker && <div className="emoji-picker-container"><EmojiPicker onEmojiClick={onEmojiClick} /></div>}
        <form className="chat-footer" onSubmit={sendMessage}>
          <button type="button" className="emoji-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😀</button>
          <input type="text" placeholder="Type a message..." value={message} onChange={(e) => setMessage(e.target.value)} />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default ChatPage;