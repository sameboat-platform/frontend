#!/usr/bin/env node
/**
 * Release automation script (lightweight, no external deps):
 * - Determines next version (patch by default; can pass --minor or --major)
 * - Moves [Unreleased] entries into new version section with current date
 * - Bumps package.json version
 * - Updates diff links at bottom (adds new [Unreleased] compare line)
 * - Commits and creates git tag (optional with --tag)
 *
 * Usage:
 *   node scripts/release.mjs                # patch bump
 *   node scripts/release.mjs --minor --tag  # minor bump + git tag
 *   node scripts/release.mjs --major        # major bump
 */
import fs from "node:fs";
import cp from "node:child_process";

const pkgPath = "package.json";
const changelogPath = "CHANGELOG.md";
const TAG_PREFIX = "v"; // standardize on v-prefixed tags (e.g., v0.2.0)

function run(cmd) {
    return cp.execSync(cmd, { stdio: "pipe" }).toString().trim();
}

function parseArgs() {
    const args = process.argv.slice(2);
    return {
        major: args.includes("--major"),
        minor: args.includes("--minor"),
        tag: args.includes("--tag"),
    };
}

function bumpVersion(current, { major, minor }) {
    const [maj, min, pat] = current.split(".").map(Number);
    if (major) return `${maj + 1}.0.0`;
    if (minor) return `${maj}.${min + 1}.0`;
    return `${maj}.${min}.${pat + 1}`; // patch default
}

function hasUnreleasedContent() {
    if (!fs.existsSync(changelogPath)) return false;
    const original = fs.readFileSync(changelogPath, "utf8");
    const unreleasedHeader = "## [Unreleased]";
    if (!original.includes(unreleasedHeader)) return false;
    const parts = original.split(unreleasedHeader);
    const after = parts[1] ?? "";
    const match = after.match(/\n## /); // start of next section
    const unreleasedBody = match ? after.slice(0, match.index) : after;
    return unreleasedBody.trim().length > 0;
}

function updatePackageJson(newVersion) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    pkg.version = newVersion;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 4) + "\n");
}

function updateChangelog(newVersion) {
    if (!fs.existsSync(changelogPath)) {
        console.error("CHANGELOG.md not found");
        process.exit(1);
    }
    const original = fs.readFileSync(changelogPath, "utf8");
    const unreleasedHeader = "## [Unreleased]";
    if (!original.includes(unreleasedHeader)) {
        console.error("No [Unreleased] section found.");
        process.exit(1);
    }
    const date = new Date().toISOString().slice(0, 10);
    const versionHeader = `## [${newVersion}] - ${date}`;

    // Extract unreleased content (between Unreleased header and next ## )
    const parts = original.split(unreleasedHeader);
    const after = parts[1];
    const match = after.match(/\n## /); // start of next section
    const unreleasedBody = match ? after.slice(0, match.index) : after;
    const remaining = match ? after.slice(match.index + 1) : "";

    if (!unreleasedBody.trim()) {
        console.error(
            "Unreleased section empty – aborting to avoid empty release."
        );
        process.exit(1);
    }

    // Rebuild changelog
    let rebuilt = original.replace(
        unreleasedHeader + unreleasedBody,
        unreleasedHeader + "\n\n"
    );
    // Insert new version header after [Unreleased]
    rebuilt = rebuilt.replace(
        unreleasedHeader + "\n\n",
        unreleasedHeader +
            "\n\n" +
            versionHeader +
            "\n" +
            unreleasedBody.trimStart()
    );

    // Update reference links at bottom (very naive; append new lines if pattern exists)
    const linkPattern = /\n\[Unreleased\]:.*\n/;
    if (linkPattern.test(rebuilt)) {
        // Extract previous latest version from the link
        const prevVersionMatch = rebuilt.match(/\n\[(\d+\.\d+\.\d+)\]:/);
        const prevVersion = prevVersionMatch ? prevVersionMatch[1] : null;
        const newUnreleasedLink = `[Unreleased]: https://github.com/sameboat-platform/frontend/compare/${TAG_PREFIX}${newVersion}...HEAD`;
        let newVersionLink = "";
        if (prevVersion) {
            newVersionLink = `\n[${newVersion}]: https://github.com/sameboat-platform/frontend/compare/${TAG_PREFIX}${prevVersion}...${TAG_PREFIX}${newVersion}`;
        } else {
            newVersionLink = `\n[${newVersion}]: https://github.com/sameboat-platform/frontend/tree/${TAG_PREFIX}${newVersion}`;
        }
        rebuilt =
            rebuilt.replace(linkPattern, "\n" + newUnreleasedLink + "\n") +
            newVersionLink +
            "\n";
    }

    fs.writeFileSync(changelogPath, rebuilt);
}

function stageCommitTag(newVersion, tag) {
    run("git add CHANGELOG.md package.json");
    run(`git commit -m "chore: release ${newVersion}"`);
    if (tag) {
        const tagName = `${TAG_PREFIX}${newVersion}`;
        // if tag exists, do not create a duplicate
        const existing = run(`git tag -l ${tagName}`);
        if (!existing) {
            run(`git tag -a ${tagName} -m "Release ${newVersion}"`);
        } else {
            console.warn(`Tag ${tagName} already exists; skipping tag creation.`);
        }
    }
}

(function main() {
    const args = parseArgs();
    // Guard: only allow running on main to avoid accidental releases from feature branches
    try {
        const branch = run("git rev-parse --abbrev-ref HEAD");
        if (branch !== "main") {
            console.error(
                `Refusing to run release on branch '${branch}'. Switch to 'main' first.`
            );
            process.exit(1);
        }
    } catch (e) {
        console.error("Unable to determine current git branch. Are you in a git repository?");
        process.exit(1);
    }
    const current = JSON.parse(fs.readFileSync(pkgPath, "utf8")).version;
    const next = bumpVersion(current, args);
    // Validate changelog before mutating package.json to avoid partial bumps on abort
    if (!hasUnreleasedContent()) {
        console.error("Unreleased section empty – aborting to avoid empty release.");
        process.exit(1);
    }
    updatePackageJson(next);
    updateChangelog(next);
    stageCommitTag(next, args.tag);
    console.log(`Released ${next}${args.tag ? " (tagged)" : ""}`);
})();
