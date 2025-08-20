import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import './App.css';

// Define types for our application
interface User {
  id: string;
  username: string;
  online: boolean;
}

interface Message {
  id?: string;
  text: string;
  sender: string;
  senderId: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  roomId?: string;
}

const socket: Socket = io('http://localhost:3000');

function App() {
  // State management
  const [isRegistered, setIsRegistered] = useState(false);
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Registration effect
  useEffect(() => {
    // Socket event listeners
    socket.on('user_list', (userList: User[]) => {
      setUsers(userList);
    });

    socket.on('registration_success', (userData) => {
      setIsRegistered(true);
    });

    socket.on('username_error', (error) => {
      alert(error);
    });

    socket.on('chat message', (msg: Message) => {
      setMessages(prevMessages => [...prevMessages, msg]);
      scrollToBottom();
    });

    // Cleanup
    return () => {
      socket.off('user_list');
      socket.off('registration_success');
      socket.off('username_error');
      socket.off('chat message');
    };
  }, []);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle user registration
  const handleRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      socket.emit('register', username);
    }
  };

  // Handle message sending
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && selectedUser) {
      const messageData: Message = {
        text: inputMessage,
        sender: username,
        senderId: socket.id || '',
        timestamp: new Date().toISOString(),
        status: 'sent',
        roomId: selectedUser.id
      };

      socket.emit('chat message', messageData);
      setMessages(prevMessages => [...prevMessages, messageData]);
      setInputMessage('');
      scrollToBottom();
    }
  };

  // Render registration form
  if (!isRegistered) {
    return (
      <div className="registration-container">
        <form onSubmit={handleRegistration} className="registration-form">
          <h2>Join Chat</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />
          <button type="submit">Register</button>
        </form>
      </div>
    );
  }

  // Render main chat interface
  return (
    <div className="whatsapp-container">
      {/* Sidebar with user list */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Chats</h2>
        </div>
        <div className="user-list">
          {users
            .filter(user => user.username !== username)
            .map(user => (
              <div 
                key={user.id} 
                className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="user-avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <h3>{user.username}</h3>
                  <p>{user.online ? 'Online' : 'Offline'}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Chat window */}
      <div className="chat-window">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <div className="user-avatar">
                {selectedUser.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <h3>{selectedUser.username}</h3>
                <p>{selectedUser.online ? 'Online' : 'Offline'}</p>
              </div>
            </div>
            <div className="messages-container">
              {messages
                .filter(msg => 
                  msg.senderId === selectedUser.id || 
                  msg.roomId === selectedUser.id
                )
                .map((msg, index) => (
                  <div 
                    key={index} 
                    className={`message ${msg.sender === username ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <span className="message-text">{msg.text}</span>
                      <span className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="message-form">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message"
              />
              <button type="submit">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M1.101 21.757 23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path>
                </svg>
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <h2>Select a chat to start messaging</h2>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
