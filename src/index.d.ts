import { PreloadMethods } from 'app/src-electron/electron-preload';

export {};

declare global {
  interface Window {
    windowApi: PreloadMethods;
  }
}
