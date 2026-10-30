import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error handlers to silence unhandled extension exceptions and HMR websocket errors
window.addEventListener('error', (event) => {
  const msg = String(event.message || '');
  if ((event.filename && event.filename.includes('chrome-extension://')) || msg.includes('WebSocket') || msg.includes('websocket')) {
    event.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const reasonStr = String(event.reason?.message || event.reason || '');
  if (reasonStr.includes('chrome-extension://') || reasonStr.includes('WebSocket') || reasonStr.includes('websocket')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(<App />);
