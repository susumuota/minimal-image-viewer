import { open, FileHandle } from 'node:fs/promises';
import path from 'node:path';
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { glob } from 'glob';
import Store from 'electron-store';
import { extractPNG, parsePNG, PNGChunkType, PNG_IHDR_Type, PNG_tEXt_Type } from 'fast-png-parser';

import type { ImageMetadataType } from './shared';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// eslint-disable-next-line no-useless-escape
const PNG_FILE_REGEXP = new RegExp('^.+\.png$', 'i');
const isPNGFile = (file: string) => file.match(PNG_FILE_REGEXP);

const getPNGMetadata = async (file: string) => {
  let fh: FileHandle | undefined = undefined;
  let chunks: PNGChunkType[] = [];
  try {
    fh = await open(file, 'r');
    chunks = await extractPNG(fh, { filter: type => ['IHDR', 'tEXt'].includes(type), maxChunks: 2 });
  } finally {
    await fh?.close();
  }
  if (!(chunks && chunks.length > 0 && chunks[0])) return { width: 0, height: 0, keyword: '', text: '' } as ImageMetadataType;
  const ihdr = parsePNG(chunks[0]) as PNG_IHDR_Type;
  if (!(chunks.length > 1 && chunks[1])) return { width: ihdr.width, height: ihdr.height, keyword: '', text: '' } as ImageMetadataType;
  const text = parsePNG(chunks[1]) as PNG_tEXt_Type;
  return { width: ihdr.width, height: ihdr.height, keyword: text.keyword, text: text.text } as ImageMetadataType;
};

const getImageMetadata = async (file: string) => {
  // TODO: other image types
  return isPNGFile(file) ? getPNGMetadata(file) : { width: 0, height: 0, keyword: '', text: '' } as ImageMetadataType;
};

const createWindow = () => {
  const options = {
    width: 800,
    height: 800,
    frame: process.platform !== 'darwin',
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

  ipcMain.handle('platform', () => process.platform);
  ipcMain.handle('dialog', (_, options) => {
    const files = dialog.showOpenDialogSync(mainWindow, options);
    if (!(files && files.length > 0)) return files;
    return process.platform === 'win32' ? files.map(file => file.replaceAll(path.win32.sep, path.posix.sep)) : files;
  });
  ipcMain.handle('glob', (_, pattern) => glob.sync(pattern));
  ipcMain.handle('set-store', (_, key, value) => store.set(key, value));
  ipcMain.handle('get-store', (_, key) => store.get(key));
  ipcMain.handle('get-image-metadata', (_, file) => getImageMetadata(file));
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
