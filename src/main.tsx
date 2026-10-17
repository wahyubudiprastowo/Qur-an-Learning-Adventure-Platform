import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for PWA & Android launcher push notifications
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // Registration successful
        if (reg.installing) {
          console.log('Tahfiz Service Worker installing');
        } else if (reg.active) {
          console.log('Tahfiz Service Worker active & ready for Android push');
        }
      })
      .catch((err) => {
        console.log('SW registration note:', err);
      });
  });

  // Listen to message from SW notification click
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'NOTIFICATION_CLICKED') {
      const { action, data } = event.data;
      if (action === 'view_calendar' || data?.url?.includes('calendar')) {
        window.location.hash = '#/calendar';
      } else if (action === 'open_murojaah' || data?.url?.includes('murojaah')) {
        window.location.hash = '#/murojaah';
      }
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
