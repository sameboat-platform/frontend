import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        setupFiles: ["./vitest.setup.ts"],
        globals: true,
        css: true,
        coverage: {
            reporter: ["text", "lcov"],
            thresholds: {
                lines: 50,
                functions: 50,
                statements: 50,
                branches: 50,
            },
        },
    },
});
