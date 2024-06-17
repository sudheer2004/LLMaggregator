// src/ChatContainer.js

import React, { useState } from 'react';
import ChatWindow from './ChatWindow';
import InputArea from './InputArea';
import './styles.css';
import axios from 'axios';

const ChatContainer = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('Gemini AI'); // Default selected model

  const sendMessage = async () => {
    if (input.trim()) {
      const newMessage = { text: input, sender: 'user' };
      setMessages([...messages, newMessage]);
      setInput('');

      try {
        let response;
        if (selectedModel === 'Gemini AI') {
          response = await axios.post('http://localhost:5000/api/gemini', { prompt: input });
        } else if (selectedModel === 'Mistral') {
          response = await axios.post('http://localhost:5000/api/mistral', { prompt: input });
        } else {
          // Handle other models here if needed
          return;
        }

        const botReply = { text: response.data.response, sender: 'bot' };
        setMessages([...messages, botReply]); // Update messages with bot's reply
      } catch (error) {
        console.error('Failed to fetch:', error);
        // Optionally handle errors here
      }
    }
  };

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value); // Update selected model when dropdown value changes
  };

  return (
    <div className="chat-container">
      <h1>LLM Aggregator</h1>
      <div className="model-select">
        <label htmlFor="modelSelect">Select Model:</label>
        <select id="modelSelect" value={selectedModel} onChange={handleModelChange}>
          <option value="Gemini AI">Gemini AI</option>
          <option value="Mistral">Mistral</option>
          {/* Add more options as needed */}
        </select>
      </div>
      <div className="chat-window">
        <ChatWindow messages={messages} />
      </div>
      <InputArea input={input} setInput={setInput} sendMessage={sendMessage} />
    </div>
  );
};

export default ChatContainer;

