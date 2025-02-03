import React, { memo } from 'react';
import SearchApp from './SearchApp';
import TrainReservationApp from './TrainReservationApp';
import VoteApp from './VoteApp';

const App = () => (
  <main>
    <SearchApp
      action={{
        '@type': 'SearchAction',
        target: 'http://example.com/search?q={q}',
        'query-input': 'required maxlength=100 name=q'
      }}
    />
    <hr />
    <VoteApp />
    <hr />
    <TrainReservationApp />
  </main>
);

export default memo(App);
