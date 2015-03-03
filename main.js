var app = require('app');
var BrowserWindow = require('browser-window');
var fs = require("fs");
var ipc = require("ipc");
var daemon = require("./lib/daemon.js");

var mainWindow = null;
var config = null;

// Quit when all windows are closed.
// TODO: Allow daemon to run in background
app.on('window-all-closed', function() {
    if (process.platform != 'darwin') {
        daemon.stop();
        app.quit();
    }
});

app.on('ready', function() {

    config = loadConfig();

    setupIPCHandlers();

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        "min-width": 800,
        "min-height": 600,
        title: "Sia"
    });

    mainWindow.loadUrl('file://' + __dirname + '/site/index.html');

    mainWindow.openDevTools();

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
});

function loadConfig() {
    // TODO: error handling
    if (fs.existsSync("config.json")) {
        return JSON.parse(fs.readFileSync("config.json"));
    } else {
        return {
            "siad_cmd": "siad",
            "siad_addr": "http://localhost:9980"
        };
    }
}

function setupIPCHandlers() {
    ipc.on("start-daemon", function() {
        daemon.start(config);
    });
    ipc.on("stop-daemon", function() {
        daemon.stop();
    });
}
