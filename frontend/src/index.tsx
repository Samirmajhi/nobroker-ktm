import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { store } from './store/store';
import { submitVisitDecision } from './store/slices/visitsSlice';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

// Handle decision deep links on initial load
try {
  const params = new URLSearchParams(window.location.search);
  const visitId = params.get('visitId');
  const action = params.get('action') as 'interested' | 'not_interested' | 'undecided' | null;
  if (visitId && action && ['interested','not_interested','undecided'].includes(action)) {
    setTimeout(() => {
      (store as any).dispatch(submitVisitDecision({ visit_id: visitId, decision: action }));
    }, 500);
  }
} catch {}
