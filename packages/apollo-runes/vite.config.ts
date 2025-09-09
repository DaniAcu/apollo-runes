import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		host: '0.0.0.0',   // expose server to Windows
		strictPort: true,
		watch: {
		  usePolling: true // ensures file changes are picked up
		}
	  }
});
