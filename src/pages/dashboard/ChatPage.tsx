import React, { useState, useRef, useEffect } from 'react';
import '../../assets/css/ChatPage.css';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

const ChatPage: React.FC = () => {
  // No mocked chat transcript: the real chat backend/API isn't wired in this build.
  // Keeping this empty prevents dummy/static data from appearing in production.
  const [messages] = useState<Message[]>([]);

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // Without a connected backend, we don't persist/send messages to avoid "fake" chat.
    setError('Chat is not connected to the backend in this build.');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="dashboard-wrapper">
      <main className="chat-page">
            <div className="chat-container">
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-header-info">
                  <div className="support-avatar">
                    <img 
                      src="https://i.pravatar.cc/150?u=support" 
                      alt="Support Agent" 
                    />
                  </div>
                  <div>
                    <h2>Chat with Sabo</h2>
                    <span className="online-status">● Online</span>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="messages-container">
                {messages.length === 0 ? (
                  <p style={{ color: '#64748B', textAlign: 'center', marginTop: '2rem' }}>
                    No messages yet.
                  </p>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message-wrapper ${message.sender === 'user' ? 'user-message' : 'support-message'}`}
                    >
                      {message.sender === 'support' && (
                        <div className="message-avatar">
                          <img
                            src="https://i.pravatar.cc/150?u=support"
                            alt="Support Agent"
                          />
                        </div>
                      )}
                      <div className="message-bubble">
                        <div className="message-text">{message.text}</div>
                        <div className="message-time">{formatTime(message.timestamp)}</div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form className="chat-input-area" onSubmit={handleSendMessage}>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => {
                    setError('');
                    setNewMessage(e.target.value);
                  }}
                />
                <button type="submit" disabled={!newMessage.trim()}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  Send
                </button>
              </form>

              {error && (
                <p style={{ color: '#c62828', margin: '1rem 0 0', textAlign: 'center' }}>
                  {error}
                </p>
              )}
            </div>
      </main>
    </div>
  );
};

export default ChatPage;