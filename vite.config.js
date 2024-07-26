
import { defineConfig } from 'vite';
import ViteYaml from '@modyfi/vite-plugin-yaml';
import wasm from "vite-plugin-wasm";
import path from "path"

export default defineConfig({
    /* root: 'src', */
    publicDir: 'public',
    build: {
        minify: "false",
        rollupOptions: {
            minify: "false",
            
        }
    },
    plugins: [
        ViteYaml(), 
        wasm(),
    ],
});

/* export default defineConfig({
    root: 'src',
    publicDir: 'public',
    build: {
        minify: "false",
        rollupOptions: {
            minify: "false"
        }
    },
    plugins: [
        ViteYaml(), 
        wasm(),
        viteSingleFile(),
    ],
}); */