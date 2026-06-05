import { useMemo } from 'react';
import { generateSortRound } from './domain/engine';
import { everydayObjects } from './content/packs/everydayObjects';
import { createStubAudioPlayer } from './audio/stubAudioPlayer';
import { SortGame } from './game/SortGame';

export default function App() {
  const audio = useMemo(() => createStubAudioPlayer(), []);
  const round = useMemo(
    () => generateSortRound({ pack: everydayObjects, targetSounds: ['b', 's'], itemsPerSound: 3 }),
    [],
  );

  return (
    <main className="app">
      <h1 className="app__title">Beginning Sounds Match</h1>
      <SortGame round={round} audio={audio} />
    </main>
  );
}
