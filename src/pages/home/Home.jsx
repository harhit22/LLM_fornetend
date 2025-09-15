import React, { useState } from 'react';
import { MessageCircle, X, Send, Trash2, BarChart3, MapPin, ChevronRight } from 'lucide-react';
import styles from './Home.module.css';

// Mock city data - you can replace with your actual cities
const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
  'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
  'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis',
  'Seattle', 'Denver', 'Washington DC', 'Boston', 'El Paso', 'Nashville',
  'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis', 'Louisville',
  'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Mesa',
  'Sacramento', 'Atlanta', 'Kansas City', 'Colorado Springs', 'Omaha'
];

const Home = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', message: 'Hello! I\'m your Waste Management AI assistant. How can I help you today?' }
  ]);

  const handleCityClick = (city) => {
    // Navigate to city dashboard - replace with your actual navigation
    console.log(`Navigating to ${city} dashboard`);
    // Example: navigate(`/dashboard/${city.toLowerCase().replace(/\s+/g, '-')}`);
    alert(`Navigating to ${city} waste management dashboard...`);
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setChatMessages([
        ...chatMessages,
        { type: 'user', message: chatMessage },
        { type: 'bot', message: 'Thank you for your message! I\'m processing your request...' }
      ]);
      setChatMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <Trash2 className={styles.logoIcon} />
            <div>
              <h1 className={styles.title}>WasteManager AI</h1>
              <span className={styles.subtitle}>Report Analyzer System</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.welcomeSection}>
          <h2 className={styles.welcomeTitle}>Select Your City</h2>
          <p className={styles.welcomeText}>
            Choose your city to access waste management analytics and AI-powered insights
          </p>
        </div>

        {/* City Grid */}
        <div className={styles.cityGrid}>
          {cities.map((city, index) => (
            <div 
              key={index}
              className={styles.cityCard}
              onClick={() => handleCityClick(city)}
            >
              <div className={styles.cityIcon}>
                <MapPin />
              </div>
              <span className={styles.cityName}>{city}</span>
              <ChevronRight className={styles.cityArrow} />
            </div>
          ))}
        </div>
      </main>

      {/* Chatbot */}
      <div className={styles.chatbot}>
        {isChatOpen && (
          <div className={styles.chatWindow}>
            <div className={styles.chatHeader}>
              <div className={styles.chatTitle}>
                <MessageCircle className={styles.chatIcon} />
                <span>AI Assistant</span>
              </div>
              <button
                className={styles.closeChat}
                onClick={() => setIsChatOpen(false)}
              >
                <X />
              </button>
            </div>
            
            <div className={styles.chatMessages}>
              {chatMessages.map((msg, index) => (
                <div key={index} className={`${styles.message} ${styles[msg.type]}`}>
                  <div className={styles.messageContent}>
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
            
            <div className={styles.chatInput}>
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className={styles.messageInput}
              />
              <button
                onClick={handleSendMessage}
                className={styles.sendButton}
              >
                <Send />
              </button>
            </div>
          </div>
        )}
        
        <button
          className={styles.chatToggle}
          onClick={() => setIsChatOpen(!isChatOpen)}
        >
          <MessageCircle />
        </button>
      </div>
    </div>
  );
};

export default Home;