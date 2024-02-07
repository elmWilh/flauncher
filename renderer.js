window.$ = window.jQuery = require("jquery");
const { ipcRenderer } = require('electron');
const fs = require("fs");
const path = require("path");
const os = require('os');

const { Auth } = require("msmc");
let authToken, mclcAuthToken;

function getJavaList(){
  var directories = [
    "C:/Program Files",
    "C:/Program Files(x86)",
    "C:/Program Files (x86)",
  ];
  var tree = [
    "Java",
    "JDK",
    "OpenJDK",
    "OpenJRE",
    "Adoptium",
    "JRE",
    "AdoptiumJRE",
    "Temurin",
    "Eclipse Foundation",
    "Eclipse Adoptium"
  ];
  var javas = [];
  directories.forEach(function (mainDir) {
    tree.forEach(function (inner) {
      var directory = mainDir + "/" + inner;
      if (fs.existsSync(directory)) {
        fs.readdirSync(directory).forEach(function (jvs) {
          if (fs.existsSync(directory + "/" + jvs + "/bin/java.exe")) {
            javas.push(directory + "/" + jvs + "/bin/java.exe");
          }
        });
      }
    });
  });
  return javas;
}

function getInstalledVersions(callback) {
  const versionsDir = path.join(os.homedir(), '.minecraft', 'versions');
  let installedVersions = [];

  fs.readdir(versionsDir, (err, files) => {
      if (err) {
          console.error('Ошибка при чтении директории версий: ', err);
          callback(installedVersions); // Возвращаем пустой массив, если есть ошибка
          return;
      }

      files.forEach(file => {
          let filePath = path.join(versionsDir, file);
          if (fs.statSync(filePath).isDirectory()) {
              installedVersions.push(file);
          }
      });

      callback(installedVersions);
  });
}