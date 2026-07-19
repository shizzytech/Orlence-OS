import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { LaunchProvider } from './context/LaunchContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <LaunchProvider>
        <App />
      </LaunchProvider>
    </AuthProvider>
  </StrictMode>,
);
