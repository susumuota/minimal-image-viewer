import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  dialog: (options: Electron.OpenDialogOptions): Promise<string[] | undefined> => ipcRenderer.invoke('dialog', options),
  glob: (pattern: string): Promise<string[]> => ipcRenderer.invoke('glob', pattern),
  storeSet: (key: string, value: unknown): Promise<void> => ipcRenderer.invoke('store-set', key, value),
  storeGet: (key: string): Promise<unknown> => ipcRenderer.invoke('store-get', key),
  devtools: (): Promise<void> => ipcRenderer.invoke('devtools'),
  quit: (): Promise<void> => ipcRenderer.invoke('quit'),
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
