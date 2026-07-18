import React from 'react';
import ReactDOM from 'react-dom/client';

// Import Bootstrap CSS trước CSS riêng để override nếu cần.
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import App from './app/App.jsx';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
