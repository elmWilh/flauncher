const VERSIONS_MANIFEST = "https://piston-meta.mojang.com/mc/game/version_manifest.json";
document.addEventListener("DOMContentLoaded", function (event) {

    var welcomeModal = document.getElementById('welcomeModal');
    var playWithAccountBtn = document.getElementById('playWithAccount');
    var playWithoutAccountBtn = document.getElementById('playWithoutAccount');

    const usernameInput = document.getElementById('usernameInput');
    const ramSlider = document.getElementById('ramSlider');
    const ramAmount = document.getElementById('ramAmount');
    const launchButton = document.getElementById('launchMinecraftButton');
    const gameLoadProgressBar = document.getElementById('gameLoadProgress');
    const gameLoadProgressValue = document.getElementById('gameLoadProgressValue');
    const gameLoadDescription = document.getElementById('gameLoadDescription');
    const openConsoleButton = document.getElementById('openConsoleButton');
    welcomeModal.style.display = "block";

    playWithAccountBtn.onclick = async function() {
        var authManager = new Auth("select_account");
        authManager.launch("raw").then(async (xboxManager) => {
            authToken = await xboxManager.getMinecraft();
            mclcAuthToken = authToken.mclc();
            usernameInput.value = authToken.profile.name;
            usernameInput.setAttribute('disabled', true);
            welcomeModal.style.display = "none";
        }).catch(error => {
            console.error("Ошибка аутентификации", error);
        });
    }
    
    playWithoutAccountBtn.onclick = function() {
        welcomeModal.style.display = "none";
        document.querySelector('.version-text').style.display = 'block';
    }

    gameLoadProgressBar.style.display = "none";
    gameLoadDescription.style.display = "none";
    gameLoadProgressValue.style.display = "none";
    $("#launchMinecraftButton").hide();

    if (typeof window.localStorage.username !== "undefined") {
        usernameInput.value = window.localStorage.username;
    }

    ramSlider.addEventListener('input', function () {
        ramAmount.textContent = `${ramSlider.value} GB`;
    });

    launchButton.addEventListener('click', function () {

        if(authToken !== ""){
            var username = ""
          } else {
            var username = usernameInput.value;
          }

        let ramAllocation = ramSlider.value;
        let curJava = getCurrentJava();
        let curVer = getCurrentVersion();
        ipcRenderer.send('launchMinecraft', username, ramAllocation, curJava, curVer, JSON.stringify(mclcAuthToken));
        gameLoadProgressBar.style.display = "block";
        gameLoadDescription.style.display = "inline";
        gameLoadProgressValue.style.display = "inline";
        ramSlider.style.display = "none";
        window.localStorage.setItem("username", username);
        gameLoadDescription.innerText = `Проверка файлов`;

        gameLoadProgressBar.style.width = "100%";
        gameLoadProgressValue.textContent = "100%";
    });

    ipcRenderer.on('gameLaunchFinished', () => {
        gameLoadProgressBar.style.width = "100%";
        gameLoadProgressValue.textContent = "100%";
    });

    ipcRenderer.on('gameLaunched', () => {
        gameLoadProgressBar.style.width = "100%";
        gameLoadProgressValue.textContent = "100%";
        gameLoadDescription.innerText = `Запускаем игру`;
    })

    ipcRenderer.on('updateDownloadStatus', (event, data) => {
        let percent = Math.round((data.current / data.total) * 100);
        gameLoadProgressBar.style.width = `${percent}%`;
        gameLoadProgressValue.textContent = `${percent}%`;
        gameLoadDescription.innerText = `Скачивание ${data.name}`;
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

});


getInstalledVersions((installedVersions) => {
    console.log('Установленные версии Minecraft:', installedVersions);
});

setTimeout(function () {
    let javas = getJavaList();
    javas.forEach((java) => {
        $("#javaSelect").append("<option>" + java + "</option>");
    })
    loadVersionsToSelect(() => {
        $("#launchMinecraftButton").show();
    });
}, 2500);

function getCurrentJava() {
    return $("#javaSelect option:selected").text();
}

function getCurrentVersion() {
    return $("#versionSelect option:selected").text();
}

function getVersionsList(cb) {
    $.get(VERSIONS_MANIFEST, (data) => {
        var versions = data.versions.filter(version => version.type === "release").map(version => version.id);
        cb(versions);
    }).fail(function() {
        console.error('Ошибка при получении списка версий с сервера Mojang');
        cb([]);
    });
}

function getInstalledVersions() {
    const dirPath = path.join(os.homedir(), 'AppData', 'Roaming', '.minecraft', 'versions');

    try {
        const versions = fs.readdirSync(dirPath);
        return versions;
    } catch (error) {
        console.error('Ошибка при чтении установленных версий Minecraft:', error);
        return [];
    }
}

function getVersionsList(cb) {
    $.get(VERSIONS_MANIFEST, (data) => {
        var versions = data.versions.filter(version => version.type === "release").map(version => version.id);
        cb(versions);
    }).fail(function() {
        console.error('Ошибка при получении списка версий с сервера Mojang');
        cb([]);
    });
}

function getInstalledVersions() {
    const dirPath = path.join(os.homedir(), 'AppData', 'Roaming', '.minecraft', 'versions');

    try {
        const versions = fs.readdirSync(dirPath);
        return versions;
    } catch (error) {
        console.error('Ошибка при чтении установленных версий Minecraft:', error);
        return [];
    }
}

function loadVersionsToSelect(cb) {
    const installedVersions = getInstalledVersions();
    installedVersions.forEach((version) => {
        $("#versionSelect").append("<option>" + version + "</option>");
    });
    getVersionsList((result) => {
        result.forEach((versions) => {
            $("#versionSelect").append("<option>" + versions + "</option>");
        });
        cb();
    })
    cb();
}