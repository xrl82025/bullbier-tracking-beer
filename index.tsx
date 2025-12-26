
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill process for browser environment to avoid "ReferenceError: process is not defined"
// Only define it if it's missing to avoid overwriting environment-injected values.
// Removed manual definition of API_KEY as per GenAI guidelines.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
