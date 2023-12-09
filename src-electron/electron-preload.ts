/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 *
 * WARNING!
 * If accessing Node functionality (like importing @electron/remote) then in your
 * electron-main.ts you will need to set the following when you instantiate BrowserWindow:
 *
 * mainWindow = new BrowserWindow({
 *   // ...
 *   webPreferences: {
 *     // ...
 *     sandbox: false // <-- to be able to import @electron/remote in preload script
 *   }
 * }
 */
import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron';
import { BrowserWindow } from '@electron/remote';

export interface PreloadMethods {
  minimize: (() => void),
  toggleMaximize: (() => void),
  close: (() => void),
  handleIsMaximized: (
    (isMaximized: (event: IpcRendererEvent, isMaximized: boolean) => void) => void
  ),
  setUnsaveState: ((isUnsaved: boolean) => void),
  handleOauth: (
    (idTokenReceived: (event: IpcRendererEvent, credentialJson: string) => void) => void
  ),
}

const preloadMethods: PreloadMethods = {
  minimize() {
    BrowserWindow.getFocusedWindow()?.minimize();
  },

  toggleMaximize() {
    const win = BrowserWindow.getFocusedWindow();

    if (win?.isMaximized()) {
      win.unmaximize();
    } else {
      win?.maximize();
    }
  },

  close() {
    BrowserWindow.getFocusedWindow()?.close();
  },

  handleIsMaximized: (isMaximized: (event: IpcRendererEvent, isMaximized: boolean) => void) => ipcRenderer.on('isMaximized', isMaximized),

  handleOauth: (credentialReceived: (event: IpcRendererEvent, credentialJson: string) => void) => ipcRenderer.on('credentialReceived', credentialReceived),

  setUnsaveState: (isUnsaved: boolean): void => {
    ipcRenderer.invoke('setUnsaveState', isUnsaved);
  },
};

contextBridge.exposeInMainWorld('windowApi', preloadMethods);
