import { http, HttpResponse, passthrough } from 'msw';
import { setupWorker } from 'msw/browser';
import React, { memo, useEffect, useState } from 'react';

const HTTPMock = () => {
  const [currentRequestJSON, setCurrentRequestJSON] = useState<string>();
  const [currentRequestURL, setCurrentRequestURL] = useState<string>();
  const [currentResponse, setCurrentResponse] = useState<unknown>();

  useEffect(() => {
    const worker = setupWorker(
      http.post('https://example.com/search', async ({ request }) => {
        setCurrentRequestJSON(JSON.stringify(await request.json(), null, 2));
        setCurrentRequestURL(request.url);
        setCurrentResponse(undefined);

        await new Promise(resolve => setTimeout(resolve, 1_000));

        const response = { result: [] };

        setCurrentResponse(response);

        return HttpResponse.json(response);
      }),
      http.post('https://example.com/vote', async ({ request }) => {
        setCurrentRequestJSON(JSON.stringify(await request.json(), null, 2));
        setCurrentRequestURL(request.url);
        setCurrentResponse(undefined);

        await new Promise(resolve => setTimeout(resolve, 1_000));

        const response = { endTime: new Date().toISOString() };

        setCurrentResponse(response);

        return HttpResponse.json(response);
      }),
      http.all('*', () => passthrough())
    );

    worker.start();

    return () => worker.stop();
  }, [setCurrentRequestJSON, setCurrentRequestURL, setCurrentResponse]);

  return (
    <section>
      <h2>HTTP Traffic</h2>
      <h3>Request URL</h3>
      <pre>{currentRequestURL}</pre>
      <h3>Request body</h3>
      <pre>{currentRequestJSON}</pre>
      <h3>Response body</h3>
      <pre>{JSON.stringify(currentResponse, null, 2)}</pre>
    </section>
  );
};

export default memo(HTTPMock);
