
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { storage } from './services/mockData';

// Inicialización asíncrona pero sin bloquear el renderizado inicial de React
(async () => {
  try {
    await storage.refreshAll();
  } catch (e) {
    console.warn("Storage Initialization: Sincronización fallida, usando caché local.", e);
  }
})();

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
