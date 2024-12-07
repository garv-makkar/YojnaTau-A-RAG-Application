import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import logo from './671e866a5147a0 Background Removed.76243754Processed 1.png';
import enterbutton from './Go Back.png';

function App() {
  const [language, setLanguage] = useState('English');
  const [inputText, setInputText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);  // Loading state

  // Replace with your backend URL
  const backendURL = "http://127.0.0.1:10000/chat";
  console.log(backendURL);

  // Clear conversation history and start a new conversation when the page loads
  useEffect(() => {
    const startNewConversation = async () => {
      try {
        // Call the backend to clear history
        await axios.post(`${backendURL.replace('/chat', '')}/clear_history`);
        setConversationHistory([]);  // Start with a fresh conversation history
      } catch (error) {
        console.error("Error clearing conversation history:", error);
      }
    };

    startNewConversation(); // Invoke the function when the component mounts
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);  // Start loading state
    setResponseText('');  // Clear previous response

    try {
      const response = await axios.post(backendURL, {
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
      await axios.post(`${backendURL.replace('/chat', '')}/clear_history`);
      
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
    .filter((msg, index) => index !== 0)  // Exclude the first message
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
          <button type="submit" className="search-button">
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
