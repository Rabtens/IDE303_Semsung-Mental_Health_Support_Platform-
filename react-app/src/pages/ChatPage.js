import React from 'react';
import './ChatPage.css';

function ChatPage() {
  return (
    <div className="chat-page">
      <iframe 
        src="/mindful_chat.html" 
        title="Semzung Chatbot" 
        className="chat-iframe"
      />
    </div>
  );
}

export default ChatPage;
