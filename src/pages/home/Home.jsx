import React, { useEffect, useState } from 'react';
import { MessageCircle, X, Send, Trash2, BarChart3, MapPin, ChevronRight } from 'lucide-react';
import styles from './Home.module.css';
import { fetchCities } from '../../api/home/citiesapi';
import { useCity } from "../../context/CityContext";
import { useNavigate } from "react-router-dom"; 

const Home = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [cities, setCities] = useState([]);
  const [error, setError] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', message: 'Hello! I\'m your Waste Management AI assistant. How can I help you today?' }
  ]);
  const { selectedCity, setSelectedCity } = useCity();  
  const navigate = useNavigate();  
  useEffect(() => {
    fetchCities()
      .then((data) => setCities(data))
      .catch((err) => setError(err.message));
  }, []);

  const handleCityClick = (cityObj) => {
    setSelectedCity(cityObj);
    navigate("/report");   
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
              <p className={styles.subtitle}>Smart Waste Management Solutions</p>
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
          {cities.map((cityObj) => (
            <div 
              key={cityObj.id}
              className={styles.cityCard}
              onClick={() => handleCityClick(cityObj)}
            >
              <div className={styles.cityIcon}>
                <MapPin />
              </div>
              <span className={styles.cityName}>{cityObj.city}</span>
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