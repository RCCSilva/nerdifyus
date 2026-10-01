import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' keeps the build portable — it works from any folder or static host.
export default defineConfig({
  base: './',
  plugins: [react()],
});
