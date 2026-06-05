/**
 * Registry of games in the platform. Data-driven so the Home grid (and later the
 * leaderboard / tutor filters) stay in sync as we add games. `bartonRef` ties
 * each game to where it sits in the scope & sequence.
 */
export interface GameInfo {
  id: string;
  title: string;
  tagline: string;
  emoji: string;
  bartonRef: string;
  status: 'available' | 'soon';
  /** Hash route when available. */
  route?: string;
}

export const GAMES: GameInfo[] = [
  {
    id: 'beginning-sounds',
    title: 'Beginning Sounds Match',
    tagline: 'Listen, then sort each picture by its first sound.',
    emoji: '🔊',
    bartonRef: 'Level 2 · Lesson 1',
    status: 'available',
    route: '#/play',
  },
  {
    id: 'ending-sounds',
    title: 'Ending Sounds',
    tagline: 'Sort pictures by the sound they end with.',
    emoji: '🎯',
    bartonRef: 'Level 2',
    status: 'soon',
  },
  {
    id: 'sight-words',
    title: 'Sight Words',
    tagline: 'Read and spell the tricky everyday words.',
    emoji: '📖',
    bartonRef: 'Levels 3+',
    status: 'soon',
  },
  {
    id: 'rhyme-time',
    title: 'Rhyme Time',
    tagline: 'Find the pictures that rhyme.',
    emoji: '🎵',
    bartonRef: 'Level 1',
    status: 'soon',
  },
];
