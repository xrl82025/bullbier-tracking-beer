
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { storage } from './services/mockData';

// Intentar carga inicial pero sin bloquear el renderizado
try {
  storage.refreshAll().catch(e => console.error("Initial refresh failed:", e));
} catch (e) {
  console.error("Critical storage error:", e);
}

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
