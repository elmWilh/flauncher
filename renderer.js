const { ipcRenderer } = require('electron');

const usernameInput = document.getElementById('usernameInput');
const ramSlider = document.getElementById('ramSlider');
const ramAmount = document.getElementById('ramAmount');
const launchButton = document.getElementById('launchMinecraftButton');
const gameLoadProgressBar = document.getElementById('gameLoadProgress');
const gameLoadProgressValue = document.getElementById('gameLoadProgressValue');

ramSlider.addEventListener('input', function () {
    ramAmount.textContent = `${ramSlider.value} GB`;
});

launchButton.addEventListener('click', function () {
    let username = usernameInput.value;
    let ramAllocation = ramSlider.value;

    if (username.trim() === '') {
        alert('Нужно ввести ник в строку с ником.');
        return;
    }

    ipcRenderer.send('launchMinecraft', username, ramAllocation);
});

ipcRenderer.on('gameLaunchFinished', () => {
    gameLoadProgressBar.style.width = "100%";
    gameLoadProgressValue.textContent = "100%";
});

document.getElementById('changeUsername').addEventListener('click', () => {
    const username = usernameInput.value;
    ipcRenderer.send('changeUsername', username);
});

document.getElementById('installVersion').addEventListener('click', () => {
    ipcRenderer.send('installVersion');
});
