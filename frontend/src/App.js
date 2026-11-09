import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import logo from './assets/tau.png';
import enterbutton from './assets/send.png';

const backendURL = (process.env.REACT_APP_API_URL || 'http://127.0.0.1:10000').replace(/\/+$/, '');

function App() {
  const [language, setLanguage] = useState('English');
  const [inputText, setInputText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);  // Loading state


  // Clear conversation history and start a new conversation when the page loads
  useEffect(() => {
    const startNewConversation = async () => {
      try {
        // Call the backend to clear history
        await axios.post(`${backendURL}/clear_history`);
        setConversationHistory([]);  // Start with a fresh conversation history
      } catch (error) {
        console.error("Error clearing conversation history:", error);
      }
    };

    startNewConversation(); // Invoke the function when the component mounts
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    setIsLoading(true);  // Start loading state
    setResponseText('');  // Clear previous response

    try {
      const response = await axios.post(`${backendURL}/chat`, {
        message: inputText
      });

      // Update conversation history with the data from the response
      setConversationHistory(response.data.conversation_history || []);
      setInputText('');  // Clear input field
      setResponseText('');  // Clear any error message
    } catch (error) {
      console.error("Error connecting to chatbot:", error);
      setResponseText('Error: Could not connect to chatbot.');
    } finally {
      setIsLoading(false);  // End loading state
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'English' ? 'Hindi' : 'English');
  };

  // New function to start a new conversation
  const startNewConversation = async () => {
    try {
      // Call the backend to clear history
      await axios.post(`${backendURL}/clear_history`);
      
      // Refresh the page to reset the frontend state
      window.location.reload();
    } catch (error) {
      console.error("Error clearing conversation history:", error);
    }
  };

  // Translations for English and Hindi
  const translations = {
    English: {
      title: "What can Tau help you with?",
      newConversation: "New Chat",
      language: "Language: English",
      messagePlaceholder: "Message Tau",
      tau: "Tau",
      you: "You",
      loading: "Loading...",
      error: "Error: Could not connect to chatbot."
    },
    Hindi: {
      title: "ताऊ आपकी किसमें मदद कर सकते हैं?",
      newConversation: "नई बातचीत",
      language: "भाषा: हिंदी",
      messagePlaceholder: "ताऊ को संदेश भेजें",
      tau: "ताऊ",
      you: "आप",
      loading: "लोड हो रहा है...",
      error: "त्रुटि: चैटबॉट से कनेक्ट नहीं हो सका।"
    }
  };

  const t = translations[language];

  return (
    <div className="App">
      <header className="header">
        <div className="header-left">
          <div className="logo">Yojna Tau</div>
          <button onClick={startNewConversation} className="new-conversation-button">
            {t.newConversation}
          </button>
        </div>
        <div className="language" onClick={toggleLanguage}>
          {t.language}
        </div>
      </header>
      <main className="main">
        <img src={logo} alt="Yojna Tau Logo" className="logo-image" />
        <h1>{t.title}</h1>

        {/* Conversation History */}
        <div className="conversation-history">
          {conversationHistory
            .filter((msg) => msg.role !== 'system')
            .map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.role === 'assistant' ? 'assistant' : 'user'}`}
              >
                <strong>{msg.role === 'assistant' ? t.tau : t.you}:</strong> {msg.content}
              </div>
            ))}
        </div>

        {/* Search Form - Now moved below conversation history */}
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder={t.messagePlaceholder}
            className="search-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="search-button" disabled={isLoading || !inputText.trim()} aria-label={t.messagePlaceholder}>
            <img src={enterbutton} alt="Enter" className="arrow-icon" />
          </button>
        </form>

        {/* Only show loading or error message if needed */}
        {isLoading ? (
          <p>{t.loading}</p>
        ) : responseText && (
          <p>{responseText}</p>
        )}
      </main>
    </div>
  );
}

export default App;
