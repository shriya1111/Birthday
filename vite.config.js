import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		noExternal: ['three']
	},
	build: {
		target: 'esnext',
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules/three/')) {
						return 'three';
					}
					if (id.includes('node_modules/@threlte/')) {
						return 'threlte';
					}
				}
			}
		}
	}
});