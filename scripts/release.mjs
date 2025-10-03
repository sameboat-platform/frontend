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
        const newUnreleasedLink = `[Unreleased]: https://github.com/sameboat-platform/frontend/compare/${newVersion}...HEAD`;
        let newVersionLink = "";
        if (prevVersion) {
            newVersionLink = `\n[${newVersion}]: https://github.com/sameboat-platform/frontend/compare/${prevVersion}...${newVersion}`;
        } else {
            newVersionLink = `\n[${newVersion}]: https://github.com/sameboat-platform/frontend/tree/${newVersion}`;
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
        run(`git tag -a ${newVersion} -m "Release ${newVersion}"`);
    }
}

(function main() {
    const args = parseArgs();
    const current = JSON.parse(fs.readFileSync(pkgPath, "utf8")).version;
    const next = bumpVersion(current, args);
    updatePackageJson(next);
    updateChangelog(next);
    stageCommitTag(next, args.tag);
    console.log(`Released ${next}${args.tag ? " (tagged)" : ""}`);
})();
