import { defineConfig } from 'vite'
// import { analyzer } from 'vite-bundle-analyzer'
import {
    advzipPlugin,
    ectPlugin,
    defaultViteBuildOptions,
    roadrollerPlugin,
} from "js13k-vite-plugins";

export default defineConfig({
    plugins: [
        // analyzer(),
        roadrollerPlugin(),
        ectPlugin(),
        advzipPlugin()
    ],
    base: "./",
    build: defaultViteBuildOptions
})