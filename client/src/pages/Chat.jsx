import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './styles/Chat.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

function Chat() {
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    setSocket(io(SOCKET_URL));
    console.log("Socket initialized");
  }, []);

  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedUser]);

  useEffect(() => {
    if (socket === null) return;

    console.log("Attempting to add user to socket:", currentUserId);
    if (currentUserId) {
      socket.emit("addUser", currentUserId);
    }
    
    socket.on("getOnlineUsers", (onlineUsers) => {
      console.log("Received online users:", onlineUsers);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          onlineUsers.includes(user._id) ? { ...user, online: true } : { ...user, online: false }
        )
      );
      console.log("Updated users state with online status:", users);
    });

    
    socket.on("receive_message", (newMessage) => {
      console.log("Received new message:", newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.off("getOnlineUsers");
      socket.off("receive_message");
      socket.disconnect();
      console.log("Socket disconnected");
    };
  }, [socket, currentUserId]);

  useEffect(() => {
    const id = localStorage.getItem("id"); // Assuming you store current user's ID
    console.log("ID from localStorage:", id);
    if (id) {
      setCurrentUserId(id);
      console.log("Current user ID set:", id);
    }

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/api/auth/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Filter out the current user from the list of users
        setUsers(res.data.filter(user => user._id !== id).map(user => ({
          ...user,
          name: user.username,
        })));
        // console.log("Users fetched and set:", fetchedUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  // Fetch messages when a user is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedUser && currentUserId) {
        console.log("Fetching messages for selected user:", selectedUser._id, "and current user:", currentUserId);
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(
            `${API_BASE_URL}/api/messages/${currentUserId}/${selectedUser._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log("Fetched messages:", res.data);
          setMessages(res.data);
        } catch (err) {
          console.error("Error fetching messages:", err);
          setMessages([]);
        }
      }
    };
    fetchMessages();
  }, [selectedUser, currentUserId]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setMessages([]); // Clear messages when a new user is selected
    console.log("User selected:", user.name, "Messages cleared.");
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '' || !selectedUser) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE_URL}/api/messages/`, 
        {
          senderId: currentUserId,
          receiverId: selectedUser._id,
          text: inputMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Message sent and added to state:", res.data);
      setMessages([...messages, res.data]);
      setInputMessage('');
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <h3>Users</h3>
        <div className="user-list">
          {users.map(user => {
            // console.log("Rendering user:", user.name, "Profile Photo URL:", user.profilePhoto);
            return (
              <div
                key={user._id}
                className={`user-item ${selectedUser && selectedUser._id === user._id ? 'selected' : ''} ${user.online ? 'online' : 'offline'}`}
                onClick={() => handleUserSelect(user)}
              >
                <img src="data:image/webp;base64,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" alt=""  className='profile-photo'/>
                <span className="user-name">{user.name}</span>
                {user.online && <span className="online-indicator"></span>}
              </div>
            );
          })}
        </div>
      </div>
      <div className="chat-main">
        <div className="chat-header">
          {selectedUser && (
            <div className="chat-header-info">
              {/* console.log("Rendering selected user header:", selectedUser.name, "Profile Photo URL:", selectedUser.profilePhoto) */}
            <img src="https://th.bing.com/th/id/OIP.U1znYlwJnJfpxILZkEmvgQHaGJ?w=184&h=180&c=7&r=0&o=5&dpr=1.5&pid=1.7" className="profile-photo header-photo" alt="" />
              <h3>{selectedUser.name}</h3>
              {selectedUser.online && <span className="online-indicator header-online-indicator"></span>}
            </div>
          )}
          {!selectedUser && <h3>Select a user to chat</h3>}
        </div>
        <div className="message-list">
          {messages.map(message => (
            <div key={message._id} className={`message-item ${message.senderId === currentUserId ? 'my-message' : 'other-message'}`}>
              <div className="message-content">
                <span className="sender-name">{message.senderId === currentUserId ? 'You' : selectedUser ? selectedUser.name : ''}:</span> {message.text}
                <span className="message-timestamp">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="message-input-area">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
