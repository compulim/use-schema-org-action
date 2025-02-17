import React, { memo } from 'react';
import HTTPMonitor from './HTTPMonitor.tsx';
import SearchApp from './SearchApp.tsx';
import VoteApp from './VoteApp.tsx';

const App = () => (
  <main>
    <SearchApp />
    <hr />
    <VoteApp />
    <hr />
    <HTTPMonitor />
    {/* <hr />
    <TrainReservationApp /> */}
  </main>
);

export default memo(App);
