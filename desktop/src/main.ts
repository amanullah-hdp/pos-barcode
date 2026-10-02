import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app, BrowserWindow, dialog } from 'electron';
import { loadOrCreateConfig, warnDefaultPin } from './config.js';
import { DESKTOP_PORT, serverLogPath, startServer, stopServer, waitForHealth } from './serverProcess.js';

const desktopRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function appIconPath(): string | undefined {
  if (process.platform !== 'win32' && process.platform !== 'linux') {
    return undefined;
  }
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'icon.ico');
  }
  return path.join(desktopRoot, 'build', 'icon.ico');
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;

async function showSplash(): Promise<void> {
  splashWindow = new BrowserWindow({
    width: 440,
    height: 180,
    resizable: false,
    minimizable: false,
    maximizable: false,
    title: 'Barcode POS',
    autoHideMenuBar: true,
    icon: appIconPath(),
  });
  const html = encodeURIComponent(
    `<!DOCTYPE html><html><body style="font-family:Segoe UI,Arial,sans-serif;padding:24px;text-align:center">
    <p style="font-size:16px;margin:0 0 8px">Barcode POS</p>
    <p style="color:#64748b;margin:0">Starting…</p>
    </body></html>`,
  );
  await splashWindow.loadURL(`data:text/html;charset=utf-8,${html}`);
}

function closeSplash(): void {
  splashWindow?.close();
  splashWindow = null;
}

async function createWindow(): Promise<void> {
  await showSplash();

  try {
    const config = loadOrCreateConfig();
    startServer(config);
    await waitForHealth();

    closeSplash();

    mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1024,
      minHeight: 700,
      title: 'Barcode POS',
      autoHideMenuBar: true,
      show: false,
      icon: appIconPath(),
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    mainWindow.once('ready-to-show', () => {
      mainWindow?.show();
    });

    await mainWindow.loadURL(`http://127.0.0.1:${DESKTOP_PORT}/`);

    if (config.pin === '0000') {
      void warnDefaultPin(mainWindow);
    }
  } catch (err) {
    closeSplash();
    const detail = err instanceof Error ? err.message : String(err);
    const log = serverLogPath();
    await dialog.showErrorBox(
      'Barcode POS could not start',
      `${detail}\n\nIf this continues, send this file to support:\n${log}`,
    );
    app.exit(1);
  }
}

app.whenReady().then(() => {
  void createWindow();
});

app.on('window-all-closed', () => {
  stopServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopServer();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    void createWindow();
  }
});
