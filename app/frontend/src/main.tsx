import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeProvider';
import { ApolloClientProvider } from './providers/ApolloClientProvider';
import { AuthProvider } from './features/auth/hooks/useAuth';
import App from './pages/App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ApolloClientProvider>
        <AuthProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </AuthProvider>
      </ApolloClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
