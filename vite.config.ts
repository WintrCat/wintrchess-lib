import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import declarations from "unplugin-dts/vite";

export default defineConfig({
    build: {
        lib: {
            entry: {
                engine: "./src/engine/index.ts",
                nodeEngine: "./src/engine/ProcessEngine.ts",
                
                coach: "./src/coach/index.ts",
                classify: "./src/classify/index.ts",
                utils: "./src/utils/index.ts",
                types: "./src/types/index.ts"
            },
            formats: ["es"]
        },
        rollupOptions: {
            external: [
                "chessops",
                "chessops/fen",
                "chessops/san",
                "chessops/util",
                "chessops/board",
                "openai",
                "child_process",
                "chalk"
            ]
        },
        emptyOutDir: true
    },
    plugins: [
        tsConfigPaths(), 
        declarations({ bundleTypes: true })
    ]
});