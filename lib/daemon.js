/*
Module for stopping/starting the daemon
*/

var child_process = require("child_process");

var daemonProcess;

// Catchs all messages from daemon stdout
// TODO: Allow hook
function daemonData(data) {
    console.log("siad: " + data);
}

// Catchs all messages from daemon stderr
// TODO: Allow hook
function daemonError(data) {
    console.error("siad: " + data);
}

// Called when daemon process ends
// TODO: Allow hook
function daemonClosed() {
    console.error("SIAD CLOSED");
}

module.exports = {
    start: function(config) {
        if (daemonProcess) {
            console.error("Daemon process already running");
            return;
        }
        // TODO: Allow arguments from config to daemon
        daemonProcess = child_process.spawn(config.siad_cmd);
        daemonProcess.stdout.on("data", daemonData);
        daemonProcess.stderr.on("data", daemonError);
        daemonProcess.on("close", daemonClosed);
    },
    stop: function() {
        if (!daemonProcess) {
            console.error("Daemon process not running!");
            return;
        }
        daemonProcess.kill("SIGINT");
        daemonProcess = null;
    }
};
