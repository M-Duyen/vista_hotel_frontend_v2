import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
            // WebSocket proxy: route directly to notification-service (port 8092).
            // Do NOT route through API Gateway (port 8080) — Spring Cloud Gateway
            // (Netty/reactive) cannot reliably proxy WebSocket to Tomcat (servlet)
            // backends with SockJS. Vite's Node.js proxy handles this correctly.
            '/ws': {
                target: 'http://localhost:8092',
                ws: true,
                changeOrigin: true,
            },
        },
    },
    define: {
        global: {},
    },
});
