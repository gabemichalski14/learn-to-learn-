import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    // jsdom's localStorage isn't exposed to the default worker pool under
    // Node 26 + Vitest 4; vmForks fixes it (our store tests need localStorage).
    pool: 'vmForks',
    setupFiles: ['./src/test/setupTests.ts'],
  },
});
