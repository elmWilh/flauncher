const { ipcRenderer } = require('electron');

const usernameInput = document.getElementById('usernameInput');
const ramSlider = document.getElementById('ramSlider');
const ramAmount = document.getElementById('ramAmount');
const launchButton = document.getElementById('launchMinecraftButton');
const gameLoadProgressBar = document.getElementById('gameLoadProgress');
const gameLoadProgressValue = document.getElementById('gameLoadProgressValue');
const openConsoleButton = document.getElementById('openConsoleButton');

ramSlider.addEventListener('input', function () {
  ramAmount.textContent = `${ramSlider.value} GB`;
});

launchButton.addEventListener('click', function () {
  let username = usernameInput.value;
  let ramAllocation = ramSlider.value;
  ipcRenderer.send('launchMinecraft', username, ramAllocation);
});

ipcRenderer.on('gameLaunchFinished', () => {
  gameLoadProgressBar.style.width = "100%";
  gameLoadProgressValue.textContent = "100%";
});

ipcRenderer.on('updateGameLaunchProgress', (event, progress) => {
  gameLoadProgressBar.style.width = `${progress}%`;
  gameLoadProgressValue.textContent = `${progress}%`;
});

openConsoleButton.addEventListener('click', () => {
  ipcRenderer.send('openConsole');
});

ipcRenderer.on('consoleLog', (event, log) => {
  const consoleOutput = document.getElementById('consoleOutput');
  const logLine = document.createElement('div');
  logLine.textContent = log;
  consoleOutput.appendChild(logLine);
});

document.getElementById('changeUsername').addEventListener('click', () => {
  const username = usernameInput.value;
  ipcRenderer.send('changeUsername', username);
});

document.getElementById('installVersion').addEventListener('click', () => {
  ipcRenderer.send('installVersion');
});
