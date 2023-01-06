import { contextBridge, ipcRenderer } from 'electron';
import type { ImageMetadataType } from './shared';

contextBridge.exposeInMainWorld('api', {
  platform: () => ipcRenderer.invoke('platform'),
  dialog: (options: Electron.OpenDialogOptions) => ipcRenderer.invoke('dialog', options),
  glob: (pattern: string) => ipcRenderer.invoke('glob', pattern),
  setStore: (key: string, value: unknown) => ipcRenderer.invoke('set-store', key, value),
  getStore: (key: string) => ipcRenderer.invoke('get-store', key),
  getImageMetadata: (file: string) => ipcRenderer.invoke('get-image-metadata', file),
  devtools: () => ipcRenderer.invoke('devtools'),
  quit: () => ipcRenderer.invoke('quit'),
})

declare global {
  interface Window {
    api: {
      platform: () => Promise<string>,
      dialog: (options: Electron.OpenDialogOptions) => Promise<string[] | undefined>,
      glob: (pattern: string) => Promise<string[]>,
      setStore: (key: string, value: unknown) => Promise<void>,
      getStore: (key: string) => Promise<unknown>,
      getImageMetadata: (file: string) => Promise<ImageMetadataType>,
      devtools: () => Promise<void>,
      quit: () => Promise<void>,
    }
  }
}
