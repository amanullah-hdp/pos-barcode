# Desktop Phase 1 — Windows installer (Electron)

Ship **BarcodePOS-Setup.exe** without giving the client source code. Development on **macOS** is supported; **final installer smoke test** needs Windows (VM, GitHub Actions artifact, or client PC).

## Mac vs Windows

| Task | Mac | Windows |
|------|-----|---------|
| Build client + server | Yes | Yes |
| Run Electron in dev (`npm run desktop:dev`) | Yes | Yes |
| Build **NSIS Setup.exe** locally | Hard (needs Wine); use **GitHub Actions** | Yes |
| Test thermal print + USB scanner | No | Yes |
| SmartScreen / real install wizard UX | No | Yes |

**Recommendation on Mac:** develop locally, push a tag or run the **Desktop Windows installer** workflow, download the `.exe` artifact, test on a Windows VM when you have one.

## Data locations

| OS | SQLite & uploads |
|----|------------------|
| Windows (installed) | `%ProgramData%\BarcodePOS\` |
| macOS (dev desktop) | `~/Library/Application Support/barcode-pos-desktop/data/` |

First launch creates `desktop-config.json` with a random session secret and default staff PIN **`0000`** — change PIN in **Settings** after login.

## Commands (repo root)

```bash
npm install
npm run build
npm run desktop:dev          # Electron window → local server on port 13101
npm run desktop:pack:mac     # unpacked app (Mac smoke test)
npm run desktop:pack:win     # NSIS .exe (best on Windows or CI)
```

`desktop:pack:*` runs `scripts/prepare-desktop-pack.mjs` first (prod server deps + `better-sqlite3` rebuilt for Electron).

## GitHub Actions (Windows .exe — **required for client PCs**)

The server uses **better-sqlite3** (native code). An `.exe` built on **macOS contains a Mac binary** and **will not start on Windows** (no window, or instant exit).

1. GitHub → **Actions** → **Desktop Windows installer** → **Run workflow**  
   (or push tag `desktop-v1.0.0`)
2. Download artifact **BarcodePOS-Setup-windows** and give **that** `.exe` to the client.

Local `npm run desktop:pack:win` on Mac **fails validation** after `desktop:prepare` unless you are on Windows.

### App “never ran” after install

| Cause | What to do |
|-------|------------|
| Wrong build (Mac-cross `.exe`) | Install from **Windows CI** artifact above |
| Server crash | Open `%ProgramData%\BarcodePOS\desktop-server.log` |
| Port 13101 in use | Close other Barcode POS / free the port |

### Slow installer

The setup unpacks Electron + server `node_modules` (~80MB+). First install can take a few minutes on older PCs; that is normal for NSIS + embedded Node.

## Client install flow

1. Run **BarcodePOS-Setup-x.y.z.exe**.
2. Choose install folder → shortcuts → Launch.
3. App opens in a dedicated window (not a separate browser install step).
4. Configure printer (80mm thermal) and scanner (USB keyboard mode) per main README.

## Phase 2 (not in this doc)

Code signing, custom NSIS wizard pages (shop name / PIN at install), auto-update.
