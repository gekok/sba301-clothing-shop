import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Import Bootstrap CSS trước CSS riêng để override nếu cần.
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import App from './App.jsx';
import { ReviewProviderDemo } from './review-demo/ReviewContextDemo.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ReviewProviderDemo>
        <App />
      </ReviewProviderDemo>
    </BrowserRouter>
  </React.StrictMode>,
);
