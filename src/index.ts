import path from 'node:path';
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
    width: 1280,
    height: 960,
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

  ipcMain.handle('dialog', (_, options) => {
    const result = dialog.showOpenDialogSync(mainWindow, options);
    return result && result.length > 0 && process.platform === 'win32' ?
      result.map((win32path: string) => win32path.split(path.win32.sep).join(path.posix.sep)) : result;
  });
  ipcMain.handle('glob', (_, pattern) => glob.sync(pattern));
  ipcMain.handle('set-store', (_, key, value) => store.set(key, value));
  ipcMain.handle('get-store', (_, key) => store.get(key));
  ipcMain.handle('devtools', () => mainWindow.webContents.openDevTools());
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
