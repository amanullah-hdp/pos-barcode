import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { app } from 'electron';
import type { DesktopConfig } from './config.js';
import { clientDistPath, serverEntryPath, shopDataDir } from './paths.js';

export const DESKTOP_PORT = 13101;

const LOG_NAME = 'desktop-server.log';

let child: ChildProcessWithoutNullStreams | null = null;
let logStream: fs.WriteStream | null = null;

function appendLog(line: string): void {
  try {
    if (!logStream) {
      const dir = shopDataDir();
      fs.mkdirSync(dir, { recursive: true });
      logStream = fs.createWriteStream(path.join(dir, LOG_NAME), { flags: 'a' });
    }
    logStream.write(`[${new Date().toISOString()}] ${line}\n`);
  } catch {
    // ignore log failures
  }
}

export function serverLogPath(): string {
  return path.join(shopDataDir(), LOG_NAME);
}

export function stopServer(): void {
  if (child) {
    child.kill('SIGTERM');
    child = null;
  }
  logStream?.end();
  logStream = null;
}

export function startServer(config: DesktopConfig): ChildProcessWithoutNullStreams {
  if (child) {
    throw new Error('Server already running');
  }

  const entry = serverEntryPath();
  if (!fs.existsSync(entry)) {
    throw new Error(`Server not built: ${entry}. Run npm run build from repo root.`);
  }
  if (!fs.existsSync(clientDistPath())) {
    throw new Error(`Client not built: ${clientDistPath()}. Run npm run build from repo root.`);
  }

  const dataDir = shopDataDir();
  fs.mkdirSync(dataDir, { recursive: true });
  appendLog('Starting embedded server…');

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: 'production',
    HOST: '127.0.0.1',
    PORT: String(DESKTOP_PORT),
    BARCODE_POS_DB: path.join(dataDir, 'pos.sqlite'),
    BARCODE_POS_DATA: dataDir,
    BARCODE_POS_PIN: config.pin,
    BARCODE_POS_SECRET: config.secret,
  };

  if (app.isPackaged) {
    env.ELECTRON_RUN_AS_NODE = '1';
    child = spawn(process.execPath, [entry], {
      env,
      stdio: 'pipe',
      windowsHide: true,
    });
  } else {
    child = spawn('node', [entry], {
      env,
      stdio: 'pipe',
      windowsHide: true,
    });
  }

  child.stdout?.on('data', (chunk: Buffer) => {
    const text = chunk.toString().trimEnd();
    console.log('[server]', text);
    appendLog(text);
  });
  child.stderr?.on('data', (chunk: Buffer) => {
    const text = chunk.toString().trimEnd();
    console.error('[server]', text);
    appendLog(`stderr: ${text}`);
  });
  child.on('exit', (code) => {
    appendLog(`Server exited with code ${code ?? 'null'}`);
    console.log('[server] exited', code);
    child = null;
  });

  return child;
}

export async function waitForHealth(timeoutMs = 60_000): Promise<void> {
  const url = `http://127.0.0.1:${DESKTOP_PORT}/api/health`;
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (!child) {
      throw new Error(
        `Server process stopped before ready. Check log: ${serverLogPath()}`,
      );
    }
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // server still booting
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(
    `Server did not become ready in time. Check log: ${serverLogPath()}`,
  );
}
