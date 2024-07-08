
import { defineConfig } from 'vite';
import ViteYaml from '@modyfi/vite-plugin-yaml';
import wasm from "vite-plugin-wasm";
import path from "path"
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
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
});

/* 
export default defineConfig({
    root: 'src',
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
    css: {
        preprocessorOptions: {
            styl: {
                additionalData: [path.resolve(__dirname, './src/themes/mini-minimal-dim.styl')],
                //imports: `@import "./src/themes/mini-minimal-dim.styl"`
                //additionalData: `@import "./src/themes/mini-minimal-dim.styl"`
            }
        }
    },
    
}); */
