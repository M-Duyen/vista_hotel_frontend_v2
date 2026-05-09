import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
            // ✅ Add WebSocket proxy for /ws endpoint
            '/ws': {
                target: 'ws://localhost:8080',
                ws: true, // Enable WebSocket proxy
                changeOrigin: true,
            },
        },
    },
    define: {
        global: {},
    },
});
