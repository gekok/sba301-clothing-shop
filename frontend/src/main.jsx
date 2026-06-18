import React from 'react';
import ReactDOM from 'react-dom/client';

// Import Bootstrap CSS trước CSS riêng để override nếu cần.
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import App from './app/App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>  
        <App />
  </React.StrictMode>,
);
