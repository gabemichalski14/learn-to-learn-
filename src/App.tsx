import { useMemo, useState } from 'react';
import { generateSortRound } from './domain/engine';
import { everydayObjects } from './content/packs/everydayObjects';
import { createStubAudioPlayer } from './audio/stubAudioPlayer';
import { SortGame } from './game/SortGame';
import { BookTree } from './game/BookTree';

export default function App() {
  const audio = useMemo(() => createStubAudioPlayer(), []);
  const [roundNo, setRoundNo] = useState(0);

  // A fresh random round each time roundNo changes; keyed remount resets game state.
  const round = useMemo(() => generateSortRound({ pack: everydayObjects }), [roundNo]);

  return (
    <main className="app">
      <header className="app__header">
        <BookTree className="app__logo" progress={1} />
        <div className="app__titles">
          <h1 className="app__title">Beginning Sounds Match</h1>
          <p className="app__brand">Learn to Learn</p>
        </div>
      </header>

      <SortGame
        key={roundNo}
        round={round}
        audio={audio}
        onPlayAgain={() => setRoundNo((n) => n + 1)}
      />
    </main>
  );
}
