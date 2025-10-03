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
                lines: process.env.COVERAGE_LINES ? parseInt(process.env.COVERAGE_LINES, 10) : 50,
                functions: process.env.COVERAGE_FUNCTIONS ? parseInt(process.env.COVERAGE_FUNCTIONS, 10) : 50,
                statements: process.env.COVERAGE_STATEMENTS ? parseInt(process.env.COVERAGE_STATEMENTS, 10) : 50,
                branches: process.env.COVERAGE_BRANCHES ? parseInt(process.env.COVERAGE_BRANCHES, 10) : 50,
            },
        },
    },
});
