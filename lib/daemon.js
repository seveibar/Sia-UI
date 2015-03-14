/*
Module for stopping/starting the daemon
*/

var child_process = require("child_process");
var daemonProcess;
var commandTest;
var gotData = false;

// Catchs all messages from daemon stdout
// TODO: Allow hook
function daemonData(data) {
    console.log("Daemon stdout siad: " + data);
    gotData = true;
}

// Catchs all messages from daemon stderr
// TODO: Allow hook
function daemonError(err) {
    console.error("Daemon OnError siad: " + error);
}

// Called when daemon process ends
// TODO: Allow hook
function daemonClosed() {
    console.error("SIAD CLOSED PREMATURELY");
}

module.exports = {
    start: function(config, callback) {
        if (daemonProcess) {
            console.error("Daemon process already running");
            return;
        }
        // TODO: Allow arguments from config to daemon
        commandTest = child_process.exec('which ' + config.siad_cmd);
        commandTest.stdout.on("data", daemonData);
        //daemonProcess.on("error", daemonError(callback));
        commandTest.on("close", function() {
            if(gotData) {
                callback(null, gotData)
                daemonProcess = child_process.spawn(config.siad_cmd);
                daemonProcess.stdout.on("data", daemonData);
                daemonProcess.on("error", daemonError);
                daemonProcess.on("close", daemonClosed);
                return;
            }
            else
            {
                callback(new Error("Siad command not found"));
                return;
            }
        });
    },
    stop: function() {
        if (!daemonProcess) {
            console.error("Daemon process not running!");
            return;
        }
        daemonProcess.kill("SIGINT");
        daemonProcess.on("error", daemonError);
        daemonProcess = null;
    }
};
