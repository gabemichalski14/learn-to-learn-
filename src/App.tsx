import { useMemo, useState } from 'react';
import { generateSortRound } from './domain/engine';
import { everydayObjects } from './content/packs/everydayObjects';
import { createStubAudioPlayer } from './audio/stubAudioPlayer';
import { SortGame } from './game/SortGame';
import { BookTree } from './game/BookTree';

const TOTAL_ROUNDS = 5;
const ITEMS_PER_ROUND = 6;

export default function App() {
  const audio = useMemo(() => createStubAudioPlayer(), []);
  const [sessionId, setSessionId] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);

  // Fresh random page whenever the session restarts or we advance a page.
  const round = useMemo(
    () => generateSortRound({ pack: everydayObjects, totalItems: ITEMS_PER_ROUND }),
    [sessionId, roundIndex],
  );

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
        key={`${sessionId}-${roundIndex}`}
        round={round}
        audio={audio}
        roundIndex={roundIndex}
        totalRounds={TOTAL_ROUNDS}
        onAdvance={() => setRoundIndex((i) => Math.min(i + 1, TOTAL_ROUNDS - 1))}
        onRestart={() => {
          setSessionId((s) => s + 1);
          setRoundIndex(0);
        }}
      />
    </main>
  );
}
