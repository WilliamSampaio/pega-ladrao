import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    firebase: [
                        'firebase/app',
                        'firebase/auth',
                        'firebase/firestore',
                        'firebase/storage',
                    ],
                    vendor: ['vue', 'vue-router', 'pinia'],
                },
            },
        },
    },
});
