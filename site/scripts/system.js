/*
This module handles system calls, abstracting system calls to a module opens
the possibility that we simulate system calls with calls to a web server to
make a web-only client.

This system module uses NodeJS to interact with the host computer.
*/

var fs = require('fs');
var child_process = require("child_process");

var system = (function() {

    function getUIConfig(callback) {
        fs.readFile("config.json", function(err, data) {
            if (err) {
                console.log("Couldn't get config.json, loading default ui config");
                getDefaultUIConfig(callback);
            } else {
                callback(JSON.parse(data));
            }
        });
    }

    function getDefaultUIConfig(callback) {
        callback({
            "siad_cmd": "siad",
            "siad_addr": "http://localhost:9980"
        });
    }

    function startDaemon(cmd, onFinish) {
        // TODO: Allow arguments from config to daemon
        var daemonProcess = child_process.spawn(cmd);
        daemonProcess.stdout.on("data", daemonData);
        daemonProcess.stderr.on("data", daemonError);
        daemonProcess.on("close", daemonClosed);

        // TODO: determine when daemon is ready to receive requests
        setTimeout(onFinish, 400);
    }

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

    return {
        "getUIConfig": getUIConfig,
        "startDaemon": startDaemon
    };
})();