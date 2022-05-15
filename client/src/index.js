import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

if (typeof window !== "undefined") {
  window.addEventListener('load', function load() {
    const loader = document.getElementById('loader');
    setTimeout(function () {
      loader.classList.add('fadeOut');
    }, 750);
  });
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <div id="loader" className="spinner">
    </div>
    <App />
  </React.StrictMode>
);
