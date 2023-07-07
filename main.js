const { app, BrowserWindow, ipcMain } = require('electron');
const { Client, Authenticator } = require('minecraft-launcher-core');
const path = require('path');
const fs = require('fs');

let launcher;
let win;

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
    },
  });

  win.loadFile('index.html');
  win.on('closed', () => {
    win = null;
  });
}

function createLauncher() {
  let launcherOptions = {
    clientPackage: null,
    authorization: Authenticator.getAuth('player'),
    root: path.join('C:', 'Users', 'atiki', 'AppData', 'Roaming', '.minecraft'),
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

  const logPath = path.join(__dirname, 'logs', 'latest.log');
  fs.mkdirSync(path.dirname(logPath), { recursive: true });

  launcher.on('debug', (message) => {
    fs.appendFileSync(logPath, `[DEBUG] ${message}\n`);
    console.log(message);
  });

  launcher.on('data', (message) => {
    fs.appendFileSync(logPath, `[DATA] ${message}\n`);
    console.log(message);

    const match = message.match(/(?<=\[[\d:]+\] \[Client thread\/INFO]: \[minecraft\/Bootstrap\]).*?(\d+)%/);
    if (match) {
      const progress = parseInt(match[1]);
      win.webContents.send('updateGameLaunchProgress', progress);
    }
  });

  ipcMain.on('launchMinecraft', (event, username, ramAllocation) => {
    launcherOptions.authorization = Authenticator.getAuth(username);
    launcherOptions.memory.max = `${ramAllocation}G`;
    console.log(`Launching Minecraft as ${username} with ${ramAllocation}GB of RAM`);

    win.webContents.send('updateGameLaunchProgress', 0);

    launcher.launch(launcherOptions, (err, child) => {
      if (err) {
        console.error('Failed to launch Minecraft', err);
        return;
      }

      child.on('close', (code) => {
        const success = code === 0;
        win.webContents.send('gameLaunchFinished', success);

        // Fill up the progress bar to 100% once the game is launched
        win.webContents.send('updateGameLaunchProgress', 100);
      });
    });
  });
}

app.whenReady().then(createWindow).then(createLauncher);

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
