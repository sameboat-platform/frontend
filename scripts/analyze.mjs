#!/usr/bin/env node
import cp from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function run(cmd, opts = {}) {
  return cp.execSync(cmd, { stdio: 'pipe', ...opts }).toString();
}

function runInherit(cmd) {
  cp.execSync(cmd, { stdio: 'inherit' });
}

function openFile(filePath) {
  try {
    const platform = process.platform;
    if (platform === 'win32') {
      // Use start to open default browser
      cp.exec(`start "" "${filePath}"`);
    } else if (platform === 'darwin') {
      cp.exec(`open "${filePath}"`);
    } else {
      cp.exec(`xdg-open "${filePath}"`);
    }
  } catch (e) {
    console.warn('Could not auto-open bundle report. Path:', filePath);
  }
}

(function main() {
  console.log('Building app in analyze mode...');
  runInherit('vite build --mode analyze');

  console.log('Generating bundle visualization...');
  let output = '';
  try {
    output = run('npx vite-bundle-visualizer');
  } catch (e) {
    // Some tools may print to stderr; attempt to capture anyway
    output = (e.stdout?.toString?.() || '') + (e.stderr?.toString?.() || '');
  }

  const match = output.match(/Generated at\s+(.+?stats\.html)/i);
  if (!match) {
    console.error('Could not locate generated stats.html path from vite-bundle-visualizer output.');
    process.exit(1);
  }
  const src = match[1].trim();
  const destDir = path.resolve('dist');
  const dest = path.join(destDir, 'bundle-stats.html');
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);

  console.log(`Bundle report copied to ${dest}`);
  console.log('Attempting to open report in your default browser...');
  openFile(dest);
})();
