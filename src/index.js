import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { NotificationsProvider } from '@mantine/notifications';
import { AppTheme } from './Components/Core/Constants/AppTheme';
import { MantineProvider } from '@mantine/core';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <MantineProvider
      withGlobalStyles 
      withNormalizeCSS
      theme={AppTheme}
    >
      <NotificationsProvider>
        <App />
      </NotificationsProvider>
    </MantineProvider>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
