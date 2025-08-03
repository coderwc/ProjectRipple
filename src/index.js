import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

export { default as DriveCard } from './components/charity/common/DriveCard';
export { default as SuccessPage } from './components/charity/pages/SuccessPage';
export { default as AddItemsPage } from './components/charity/pages/AddItemsPage';
export { default as RequestItemPage } from './components/charity/pages/AddItemsPage';
export { default as DashboardPage } from './components/charity/pages/Dashboard';