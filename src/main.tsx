import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { UserProgressionProvider } from './context/UserProgressionContext';
import { AppContent } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <UserProgressionProvider>
        <AppContent />
      </UserProgressionProvider>
    </AuthProvider>
  </React.StrictMode>
);
