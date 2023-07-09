const { app, BrowserWindow, ipcMain } = require('electron');
const { Client, Authenticator } = require('minecraft-launcher-core');
const os = require('os');
const path = require('path');

let launcher;
let win;
let consoleWindow;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    frame: false,
    show: true,
    icon: path.join(__dirname, 'icons/server-icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      devTools: false,
    },
  });

  win.loadFile('index.html');
  win.on('closed', () => {
    win = null;
    if (consoleWindow) {
      consoleWindow.close();
    }
  });
}

function createLauncher() {
  let launcherOptions = {
    clientPackage: null,
    authorization: Authenticator.getAuth('player'),
    root: path.join(os.homedir(), 'AppData', 'Roaming', '.minecraft'),
    version: {
      number: '1.20',
      type: 'release',
    },
    memory: {
      max: '16G',
      min: '4G',
    },
  };

  launcher = new Client();

  launcher.on('debug', (message) => {
    console.log(message);
    consoleWindow.webContents.send('consoleLog', `[DEBUG] ${message}`);
  });

  launcher.on('data', (message) => {
    console.log(message);
    consoleWindow.webContents.send('consoleLog', `[DATA] ${message}`);
  
    // Не работает. В процессе разработки.
    if (message.includes('MCLC version 3.17.1')) {
      win.webContents.send('updateGameLaunchProgress', 10);
    } else if (message.includes('Downloaded assets')) {
      win.webContents.send('updateGameLaunchProgress', 50);
    } else if (message.includes('Launching with arguments')) {
      win.webContents.send('updateGameLaunchProgress', 100);
    }
  });

  ipcMain.on('launchMinecraft', (event, username, ramAllocation) => {
    launcherOptions.authorization = Authenticator.getAuth(username);
    launcherOptions.memory.max = `${ramAllocation}G`;
    console.log(`Launching Minecraft as ${username} with ${ramAllocation}GB of RAM`);

    launcher.launch(launcherOptions);
  });
}

function createConsoleWindow() {
  consoleWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    frame: false,
    show: false,
    icon: path.join(__dirname, 'icons/dev.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      devTools: false,
    },
  });

  consoleWindow.loadFile('console.html');
  consoleWindow.once('ready-to-show', () => {
    consoleWindow.show();
  });

  consoleWindow.on('closed', () => {
    consoleWindow = null;
  });
}

app.whenReady()
  .then(createWindow)
  .then(createLauncher)
  .then(createConsoleWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
