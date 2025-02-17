import React, { memo } from 'react';
import HTTPMonitor from './HTTPMonitor';
import SearchApp from './SearchApp';
import VoteApp from './VoteApp';

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
