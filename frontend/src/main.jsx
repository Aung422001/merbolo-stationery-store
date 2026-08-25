import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// Clear any stale/corrupt localStorage cart data on startup
try {
  const raw = localStorage.getItem('merbolo_guest_cart');
  if (raw) {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) localStorage.removeItem('merbolo_guest_cart');
  }
} catch (e) {
  localStorage.removeItem('merbolo_guest_cart');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
