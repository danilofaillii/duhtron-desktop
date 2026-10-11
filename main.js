/**
 * DuhTron Desktop: una finestra che apre duhtron.com.
 * Niente integrazioni Node nella pagina: la finestra è solo un browser dedicato.
 */
const { app, BrowserWindow, shell, Menu, session } = require('electron');
const fs = require('fs');
const path = require('path');

const HOME = 'https://duhtron.com';
const DOMINI_NOSTRI = ['duhtron.com', 'www.duhtron.com'];

// Una sola finestra: se l'app è già aperta, si porta davanti quella
if (!app.requestSingleInstanceLock()) app.quit();

let win = null;
const statoFile = () => path.join(app.getPath('userData'), 'finestra.json');

function leggiStato() {
  try { return JSON.parse(fs.readFileSync(statoFile(), 'utf8')); } catch (e) { return {}; }
}
function salvaStato() {
  if (!win) return;
  try {
    const b = win.getNormalBounds();
    fs.writeFileSync(statoFile(), JSON.stringify({ ...b, max: win.isMaximized() }));
  } catch (e) { /* pazienza */ }
}

function nostra(u) {
  try { return DOMINI_NOSTRI.includes(new URL(u).hostname); } catch (e) { return false; }
}

function creaFinestra() {
  const s = leggiStato();
  win = new BrowserWindow({
    width: s.width || 480,
    height: s.height || 860,
    x: s.x, y: s.y,
    minWidth: 360,
    minHeight: 560,
    backgroundColor: '#EEF1FA',
    icon: path.join(__dirname, 'build', 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      spellcheck: false
    }
  });
  if (s.max) win.maximize();

  // I link esterni (condivisioni, social) si aprono nel browser di sistema
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (nostra(url)) return { action: 'allow' };
    shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!nostra(url)) { e.preventDefault(); shell.openExternal(url); }
  });

  // Senza internet: una pagina di cortesia con il pulsante Riprova
  win.webContents.on('did-fail-load', (e, codice, desc, url, frame) => {
    if (frame && codice !== -3) win.loadFile('offline.html');
  });

  win.on('close', salvaStato);
  win.on('closed', () => { win = null; });
  win.loadURL(HOME + '/?app=desktop');
}

app.on('second-instance', () => {
  if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
});

app.whenReady().then(() => {
  // Il microfono del portale (domanda a voce) funziona; tutto il resto si nega
  session.defaultSession.setPermissionRequestHandler((wc, perm, cb) => {
    cb(perm === 'media' || perm === 'microphone' || perm === 'audioCapture' ||
       perm === 'clipboard-sanitized-write' || perm === 'notifications' || perm === 'fullscreen');
  });

  // Menu minimo: scorciatoie di sistema (copia, incolla, zoom) senza barra ingombrante
  const voci = [
    ...(process.platform === 'darwin' ? [{ role: 'appMenu' }] : []),
    { role: 'editMenu', label: 'Modifica' },
    {
      label: 'Visualizza',
      submenu: [
        { role: 'reload', label: 'Ricarica' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Dimensione normale' },
        { role: 'zoomIn', label: 'Ingrandisci' },
        { role: 'zoomOut', label: 'Riduci' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Schermo intero' }
      ]
    },
    { role: 'windowMenu', label: 'Finestra' }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(voci));
  creaFinestra();

  app.on('activate', () => { if (!win) creaFinestra(); });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
