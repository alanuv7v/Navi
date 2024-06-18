
import { defineConfig } from 'vite';
import ViteYaml from '@modyfi/vite-plugin-yaml';
import wasm from "vite-plugin-wasm";

export default defineConfig({
    root: 'src',
    build: {
        rollupOptions: {
            entry: 'index.html'
        }
    },
    server: {
        headers: {
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin',
        }
    },
    plugins: [
        ViteYaml(), 
        wasm(),
    ],
});

/* export default defineConfig({
    root: 'src',
    build: {
        rollupOptions: {
            input: 'index.html'
        }
    },
    server: {
        headers: {
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin',
        },
        serve: {
            './icons' : 'icons'
        }
    },
    plugins: [
    ViteYaml(), 
    ],
}); */