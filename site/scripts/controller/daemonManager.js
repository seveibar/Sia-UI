controller.daemonManager = (function() {

    function start(config, callback) {
        system.startDaemon(config.siad_cmd, callback);
    }

    function stop() {
        // TODO: implement daemon stopping
    }

    return {
        "start": start,
        "stop": stop
    };
})();