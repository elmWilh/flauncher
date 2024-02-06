window.$ = window.jQuery = require("jquery");
const { ipcRenderer } = require('electron');
const fs = require("fs");
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