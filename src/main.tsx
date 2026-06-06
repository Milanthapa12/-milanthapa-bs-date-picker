import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import SingleDate from './SingleDate';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* <App /> */}
    <SingleDate />
  </React.StrictMode>
);
