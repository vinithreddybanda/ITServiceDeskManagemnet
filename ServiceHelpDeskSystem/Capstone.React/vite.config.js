import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
    server: {
        port: 64601,
        proxy: {
            '/ITSRPAPI': {
                target: 'https://localhost:5193',
                changeOrigin: true,
                secure: false,
            },
        },
    }
})