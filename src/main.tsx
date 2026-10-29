import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error handlers to silence unhandled extension exceptions
window.addEventListener('error', (event) => {
  if (event.filename && event.filename.includes('chrome-extension://')) {
    event.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const reasonStr = String(event.reason || '');
  if (reasonStr.includes('chrome-extension://')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(<App />);
