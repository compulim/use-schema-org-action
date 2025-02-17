import React from 'react';
import './index.css';
// This is needed for testing React 16 and 17.
// eslint-disable-next-line react/no-deprecated
import { render } from 'react-dom';

import App from './App.tsx';

(async () => {
  const rootElement = document.getElementById('root');

  // rootElement && createRoot(rootElement).render(<App />);

  render(<App />, rootElement);
})();
