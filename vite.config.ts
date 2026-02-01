import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import declarations from "unplugin-dts/vite";

export default defineConfig({
    build: {
        lib: {
            entry: {
                engine: "./src/engine/index.ts",
                commentary: "./src/commentary/index.ts",
                classify: "./src/classify/index.ts",
                utils: "./src/utils/index.ts",
                types: "./src/types/index.ts"
            },
            formats: ["cjs", "es"]
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