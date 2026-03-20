import React, { useState, useRef, useEffect } from 'react';
import '../../assets/css/ChatPage.css';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! 👋 How can I help you today?",
      sender: 'support',
      timestamp: new Date('2024-03-15T10:30:00')
    },
    {
      id: 2,
      text: "I have a question about my recent transaction.",
      sender: 'user',
      timestamp: new Date('2024-03-15T10:35:00')
    },
    {
      id: 3,
      text: "Sure, I'd be happy to assist. Could you please provide the transaction reference?",
      sender: 'support',
      timestamp: new Date('2024-03-15T10:40:00')
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setNewMessage('');

    // Simulate support reply
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          text: "Thanks for your message. Our team will get back to you shortly.",
          sender: 'support',
          timestamp: new Date()
        }
      ]);
    }, 1000);
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
                {messages.map((message) => (
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
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form className="chat-input-area" onSubmit={handleSendMessage}>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" disabled={!newMessage.trim()}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  Send
                </button>
              </form>
            </div>
      </main>
    </div>
  );
};

export default ChatPage;