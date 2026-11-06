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

// Ensure Impact.com verification tag is first child in <head>
try {
  let impactMeta = document.querySelector("meta[name='impact-site-verification']");
  if (!impactMeta) {
    impactMeta = document.createElement('meta');
    impactMeta.setAttribute('name', 'impact-site-verification');
    impactMeta.setAttribute('value', 'b1ae4431-d331-41dd-a031-905fa7d5844a');
    document.head.insertBefore(impactMeta, document.head.firstChild);
  } else {
    impactMeta.setAttribute('value', 'b1ae4431-d331-41dd-a031-905fa7d5844a');
  }
  console.log("✅ Impact verification tag added - b1ae4431-d331-41dd-a031-905fa7d5844a - Ready for Add Website verification");
} catch (e) {}

createRoot(document.getElementById('root')!).render(<App />);
