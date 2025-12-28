import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import declarations from "unplugin-dts/vite";

export default defineConfig({
    build: {
        lib: {
            entry: {
                index: "./src/index.ts",
                commentary: "./src/commentary/index.ts",
                utils: "./src/utils/index.ts",
                classify: "./src/classify/index.ts"
            },
            formats: ["cjs", "es"]
        },
        rollupOptions: {
            external: ["chessops", "openai"]
        },
        emptyOutDir: true
    },
    plugins: [
        tsConfigPaths(), 
        declarations({ bundleTypes: true })
    ]
});