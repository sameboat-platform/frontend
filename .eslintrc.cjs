module.exports = {
    root: true,
    env: { browser: true, es2021: true, node: true },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: false, // set to tsconfig.json if you later need type-aware rules
        ecmaFeatures: { jsx: true },
    },
    plugins: ["@typescript-eslint", "react", "react-hooks", "jsx-a11y"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:jsx-a11y/recommended",
    ],
    settings: {
        react: { version: "detect" },
    },
    rules: {
        // sensible defaults
        "react/react-in-jsx-scope": "off", // Vite + React 17+ doesn’t need React in scope
        "react/prop-types": "off", // we use TypeScript for types
        "@typescript-eslint/explicit-module-boundary-types": "off",
        // a11y nudges that are helpful in forms/links
        "jsx-a11y/anchor-is-valid": "warn",
        "jsx-a11y/no-autofocus": "warn",
    },
    ignorePatterns: [
        "dist",
        "build",
        "node_modules",
        "*.config.*",
        "**/*.d.ts",
    ],
};
