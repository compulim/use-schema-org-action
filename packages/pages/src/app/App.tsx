import React, { memo } from 'react';
import HTTPMock from './HTTPMock.tsx';
import SearchApp from './SearchApp.tsx';
import VoteApp from './VoteApp.tsx';

const App = () => (
  <main>
    <SearchApp />
    <hr />
    <VoteApp />
    <hr />
    <HTTPMock />
  </main>
);

export default memo(App);
