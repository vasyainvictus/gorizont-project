import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { SDKProvider } from '@tma.js/sdk-react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* We will always render the SDKProvider, but hooks inside will be conditional */}
    <SDKProvider acceptCustomStyles debug>
      <App />
    </SDKProvider>
  </React.StrictMode>,
);