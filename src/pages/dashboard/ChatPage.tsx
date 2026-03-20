import React from 'react';
import '../../assets/css/ChatPage.css';

const ChatPage: React.FC = () => {
  // Tawk.to widget is loaded globally (see `src/components/TawkToWidget.tsx`).
  // This page keeps a clean layout for the route.
  // (no state needed; placeholder copy only)

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

              <div className="messages-container" aria-busy={false}>
                <p style={{ color: '#64748B', textAlign: 'center', marginTop: '2rem' }}>
                  Use the floating chat button to contact support.
                </p>
              </div>
            </div>
      </main>
    </div>
  );
};

export default ChatPage;