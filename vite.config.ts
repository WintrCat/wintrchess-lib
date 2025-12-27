import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import declarations from "vite-plugin-dts";

export default defineConfig({
    build: {
        lib: {
            entry: "./src/index.ts",
            formats: ["cjs", "es"],
            fileName: "index"
        },
        rollupOptions: {
            external: ["chessops"]
        },
        emptyOutDir: true
    },
    plugins: [tsConfigPaths(), declarations()]
});