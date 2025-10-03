#!/usr/bin/env node
/**
 * Simple heuristic changelog check.
 * Fails (exit 1) if there are source changes but CHANGELOG.md was not touched.
 * Intended to be run manually or wired into CI as a pre-build guard.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

if (!existsSync("CHANGELOG.md")) {
    console.error("CHANGELOG.md missing – please add it.");
    process.exit(1);
}

// Get changed files against origin/main (fallback to main if remote not fetched yet)
function git(cmd) {
    return execSync(cmd, { stdio: "pipe" }).toString().trim();
}

let base = "origin/main";
try {
    git("git rev-parse --verify origin/main");
} catch {
    base = "main";
}

let diffFiles = "";
try {
    diffFiles = git(`git diff --name-only ${base}`);
} catch {
    // If diff fails (e.g. initial commit), permit silently
    process.exit(0);
}

if (!diffFiles) process.exit(0);
const files = diffFiles.split("\n").filter(Boolean);
const srcTouched = files.some(
    (f) => f.startsWith("src/") || f === "package.json" || f.startsWith("docs/")
);
const changelogTouched = files.includes("CHANGELOG.md");

if (srcTouched && !changelogTouched) {
    console.error(
        "\nChangelog check failed: source/docs changes detected without CHANGELOG.md update."
    );
    console.error("Changed files:\n" + files.join("\n"));
    console.error("\nPlease add an entry under [Unreleased].");
    process.exit(1);
}

console.log("Changelog check passed.");
