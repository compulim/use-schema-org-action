import React from 'react';
import './index.css';
// This is needed for testing React 16 and 17.
// eslint-disable-next-line react/no-deprecated
import { http, HttpResponse, passthrough } from 'msw';
import { setupWorker } from 'msw/browser';
import { render } from 'react-dom';

import App from './App.tsx';

(async () => {
  await setupWorker(
    http.post('https://example.com/search', async () => {
      await new Promise(resolve => setTimeout(resolve, 1_000));

      return HttpResponse.json({});
    }),
    http.post('https://example.com/vote', async () => {
      await new Promise(resolve => setTimeout(resolve, 1_000));

      return HttpResponse.json({ endTime: new Date().toISOString() });
    }),
    http.all('*', () => passthrough())
  ).start();

  const rootElement = document.getElementById('root');

  // rootElement && createRoot(rootElement).render(<App />);

  render(<App />, rootElement);
})();
