import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  dialog: (options: Electron.OpenDialogOptions) => ipcRenderer.invoke('dialog', options),
  glob: (pattern: string) => ipcRenderer.invoke('glob', pattern),
  storeSet: (key: string, value: unknown) => ipcRenderer.invoke('store-set', key, value),
  storeGet: (key: string) => ipcRenderer.invoke('store-get', key),
  devtools: () => ipcRenderer.invoke('devtools'),
  quit: () => ipcRenderer.invoke('quit'),
})

declare global {
  interface Window {
    api: {
      dialog: (options: Electron.OpenDialogOptions) => Promise<string[] | undefined>,
      glob: (pattern: string) => Promise<string[]>,
      storeSet: (key: string, value: unknown) => Promise<void>,
      storeGet: (key: string) => Promise<unknown>,
      devtools: () => Promise<void>,
      quit: () => Promise<void>,
    }
  }
}
