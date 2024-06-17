// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import ChatContainer from './ChatContainer';
import './styles.css';

const container = document.getElementById('root');
const root = createRoot(container); // Create root using createRoot API

root.render(
  <React.StrictMode>
    <ChatContainer />
  </React.StrictMode>
);
