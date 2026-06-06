import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        // Cosmetic only: rename the auto-split Supabase SDK chunk from the
        // default `dist-*.js` (derived from its `@supabase/supabase-js/dist`
        // path) to a legible `supabase-*.js`. This runs after chunking, so it
        // never alters the import graph — the chunk stays a lazy async import,
        // fetched only when a cloud feature calls getSupabase(). (Manual
        // code-splitting groups were avoided here precisely because they force
        // the chunk eager via a static edge + modulepreload.)
        chunkFileNames: (chunk) =>
          chunk.moduleIds.some((id) => id.includes('@supabase'))
            ? 'assets/supabase-[hash].js'
            : 'assets/[name]-[hash].js',
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    // jsdom's localStorage isn't exposed to the default worker pool under
    // Node 26 + Vitest 4; vmForks fixes it (our store tests need localStorage).
    pool: 'vmForks',
    setupFiles: ['./src/test/setupTests.ts'],
  },
});
