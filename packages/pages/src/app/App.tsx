import React, { memo } from 'react';
import SearchApp from './SearchApp';
import VoteApp from './VoteApp';

const App = () => (
  <main>
    <SearchApp />
    <hr />
    <VoteApp />
    {/* <hr />
    <TrainReservationApp /> */}
  </main>
);

export default memo(App);
