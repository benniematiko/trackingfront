import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';          // ← add this line
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);