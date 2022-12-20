import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { glob } from 'glob';
import Store from 'electron-store';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const options = {
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      // TODO: this enables file:/// in development env, but don't want to turn webSecurity off
      // https://stackoverflow.com/a/48788049
      webSecurity: process.env['NODE_ENV'] !== 'development',
    },
  };

  const store = new Store();
  Object.assign(options, store.get('windowBounds'));
  // console.debug('mainWindow options === ', options);

  const mainWindow = new BrowserWindow(options);

  mainWindow.on('close', () => {
    store.set('windowBounds', mainWindow.getBounds());
  });

  ipcMain.handle('dialog', (_, options) => dialog.showOpenDialogSync(mainWindow, options));
  ipcMain.handle('glob', (_, pattern) => glob.sync(pattern));
  ipcMain.handle('store-set', (_, key, value) => store.set(key, value));
  ipcMain.handle('store-get', (_, key) => store.get(key));
  ipcMain.handle('devtools', () => mainWindow.webContents.isDevToolsOpened() ? mainWindow.webContents.closeDevTools() : mainWindow.webContents.openDevTools());
  ipcMain.handle('quit', () => app.quit());

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
