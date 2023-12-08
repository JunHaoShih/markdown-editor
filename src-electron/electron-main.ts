import {
  app, BrowserWindow, dialog, ipcMain, nativeTheme, shell,
} from 'electron';
import { initialize, enable } from '@electron/remote/main';
import path from 'path';
import os from 'os';
import { URL } from 'url';

initialize();

let unsaved = false;

let hasConfirmedClose = false;

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

try {
  if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    // eslint-disable-next-line global-require
    require('fs').unlinkSync(
      path.join(app.getPath('userData'), 'DevTools Extensions'),
    );
  }
} catch (_) { /* empty */ }

let mainWindow: BrowserWindow | undefined;
let splashScreen: BrowserWindow | undefined;

/**
 * Setup scheme protocol
 */
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('markdown-editor', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('markdown-editor');
}

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
    width: 1000,
    height: 600,
    useContentSize: true,
    frame: false,
    webPreferences: {
      sandbox: false,
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
  });

  splashScreen = new BrowserWindow({
    width: 500,
    height: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
  });

  mainWindow.hide();

  const publicFolder = path.resolve(__dirname, process.env.QUASAR_PUBLIC_FOLDER || '');
  splashScreen.loadFile(path.resolve(publicFolder, 'splash.html'));
  splashScreen.center();
  splashScreen.show();

  enable(mainWindow.webContents);

  mainWindow.loadURL(process.env.APP_URL);

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools();
    });
  }

  // Intercept url window open
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if ((url.startsWith('http:') || url.startsWith('https:')) && !url.includes('/__/auth/handler?')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('isMaximized', true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('isMaximized', false);
  });

  mainWindow.on('close', async (event) => {
    if (!hasConfirmedClose) {
      if (unsaved && mainWindow) {
        event.preventDefault();
        const choice = await dialog.showMessageBox(mainWindow, {
          type: 'question',
          buttons: ['Yes', 'No'],
          title: 'Confirm',
          message: 'Are you sure you want to quit? Some files are not saved yet.',
        });
        if (choice.response === 0) {
          hasConfirmedClose = true;
          mainWindow.close();
        }
      }
    }
  });

  // Close splash screen and open main window on load finish
  mainWindow.webContents.on('did-finish-load', () => {
    setTimeout(() => {
      splashScreen?.close();
      mainWindow?.show();
    }, 2000);
  });

  ipcMain.handle('setUnsaveState', (_event, isUnsaved: boolean) => {
    unsaved = isUnsaved;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === undefined) {
    createWindow();
  }
});

const single = app.requestSingleInstanceLock();
if (!single) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();

      // the commandLine is array of strings in which last element is deep link url
      // We only handle login when electron is open
      const externalUrl = new URL(commandLine.pop() ?? '');
      mainWindow?.webContents.send('googleTokenReceived', externalUrl.searchParams.get('idToken'));
    }
  });
}

const url = new URL('markdown-editor://googleAuth?idToken=123&callbackId=1');
console.log(url);
