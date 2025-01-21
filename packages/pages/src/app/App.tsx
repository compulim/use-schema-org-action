import React, { memo } from 'react';
import TrainReservationApp from './TrainReservationApp';
import VoteApp from './VoteApp';

const App = () => (
  <main>
    <VoteApp />
    <hr />
    <TrainReservationApp />
  </main>
);

export default memo(App);
