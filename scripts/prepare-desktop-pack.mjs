#!/usr/bin/env node
/**
 * Stage client + server (prod deps) for electron-builder extraResources.
 * Run from repo root after `npm run build`.
 *
 * Windows installers MUST use native modules built for win32/x64.
 * Set DESKTOP_PACK_PLATFORM=win32 (done by npm run desktop:pack:win).
 * Building on macOS cannot produce a working Windows .exe — use GitHub Actions
 * "Desktop Windows installer" or a Windows PC.
 */
import { cpSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packRoot = path.join(root, 'desktop', 'pack');
const serverPack = path.join(packRoot, 'server');
const clientPack = path.join(packRoot, 'client', 'dist');

const packPlatform = process.env.DESKTOP_PACK_PLATFORM || process.platform;
const packArch = process.env.DESKTOP_PACK_ARCH || (packPlatform === 'win32' ? 'x64' : process.arch);

const desktopPkg = JSON.parse(
  readFileSync(path.join(root, 'desktop', 'package.json'), 'utf8'),
);
const electronVersion = desktopPkg.devDependencies.electron.replace(/^\^/, '');

function sqliteNativePath() {
  return path.join(serverPack, 'node_modules', 'better-sqlite3', 'build', 'Release', 'better_sqlite3.node');
}

/** PE files start with "MZ"; Mach-O is not valid on Windows. */
function assertSqliteNativeMatchesTarget() {
  const nodePath = sqliteNativePath();
  const head = readFileSync(nodePath);
  const isPe = head[0] === 0x4d && head[1] === 0x5a;
  const isMachO =
    (head[0] === 0xcf && head[1] === 0xfa && head[2] === 0xed && head[3] === 0xfe) ||
    (head[0] === 0xce && head[1] === 0xfa && head[2] === 0xed && head[3] === 0xfe);

  if (packPlatform === 'win32' && !isPe) {
    console.error('');
    console.error('ERROR: better-sqlite3 is not a Windows native module (wrong architecture/OS).');
    console.error('The installed .exe would start then exit with no window.');
    console.error('');
    console.error('Build the Windows installer ON Windows:');
    console.error('  • GitHub → Actions → "Desktop Windows installer" → Run workflow → download artifact');
    console.error('  • Or on a Windows PC: npm ci && npm run desktop:pack:win');
    console.error('');
    if (isMachO) {
      console.error('(Detected a macOS binary — typical when packing on Mac without a Windows runner.)');
    }
    process.exit(1);
  }
}

if (packPlatform === 'win32' && process.platform !== 'win32') {
  console.warn('');
  console.warn('Warning: packing for Windows on a non-Windows host.');
  console.warn('Native modules must still be win32/x64 — validation runs after rebuild.');
  console.warn('');
}

rmSync(packRoot, { recursive: true, force: true });
mkdirSync(serverPack, { recursive: true });
mkdirSync(clientPack, { recursive: true });

cpSync(path.join(root, 'server', 'dist'), path.join(serverPack, 'dist'), { recursive: true });
cpSync(path.join(root, 'server', 'package.json'), path.join(serverPack, 'package.json'));

cpSync(path.join(root, 'client', 'dist'), clientPack, { recursive: true });

console.log('Installing production server dependencies into desktop/pack/server …');
const npmInstall = spawnSync('npm', ['install', '--omit=dev', '--ignore-scripts'], {
  cwd: serverPack,
  stdio: 'inherit',
});
if (npmInstall.status !== 0) {
  process.exit(npmInstall.status ?? 1);
}

console.log(
  `Rebuilding better-sqlite3 for Electron ${electronVersion} (${packPlatform}/${packArch}) …`,
);
const rebuild = spawnSync(
  'npx',
  [
    '@electron/rebuild',
    '-f',
    '-w',
    'better-sqlite3',
    '-v',
    electronVersion,
    '-p',
    packPlatform,
    '-a',
    packArch,
  ],
  { cwd: serverPack, stdio: 'inherit' },
);
if (rebuild.status !== 0) {
  process.exit(rebuild.status ?? 1);
}

assertSqliteNativeMatchesTarget();

console.log('Desktop pack ready at desktop/pack/');
