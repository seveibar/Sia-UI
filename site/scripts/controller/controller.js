var controller = (function() {

    var data = {};
    var createdAddressList = [];
    var dataListeners = {};
    var uiConfig;

    function init() {
        $.get("http://www.siacoin.com/betamessage.txt", function(content){
            ui.notify(content);
        });
        system.getUIConfig(function(config) {
            uiConfig = config;

            controller.daemonManager.start(config, function() {
                prepareUI();
            });
        });
    }

    function prepareUI() {
        update();
        addListeners();

        setInterval(function() {
            update();
        }, 250);

        // Wait two seconds then check for a Sia client update
        setTimeout(function() {
            promptUserIfUpdateAvailable();
        }, 2000);
    }

    function promptUserIfUpdateAvailable() {
        checkForUpdate(function(update) {
            data.Version = update.Version;
            if (update.Available) {
                ui.notify("New Sia Client Available: Click to update to " + update.Version + "!", "update", function() {
                    updateClient(update.Version);
                });
            } else {
                ui.notify("Sia client up to date!", "success");
            }
        });
    }

    function checkForUpdate(callback) {
        $.getJSON(uiConfig.siad_addr + "/daemon/update/check", callback);
    }

    function updateClient(version) {
        $.get(uiConfig.siad_addr + "/daemon/update/apply", {
            version: version
        });
    }

    function httpApiCall(url, params, callback, errorCallback) {
        params = params || {};
        $.getJSON(uiConfig.siad_addr + url, params, function(data) {
            if (callback) callback(data);
        }).error(function(err) {
            if (!errorCallback) {
                console.error("BAD CALL TO", url, arguments);
                ui.notify("Error calling " + url + " : " + err.responseText, "error");
            } else {
                errorCallback();
            }
        });
    }

    function addListeners() {
        ui.addListener("add-miner", function() {
            httpApiCall("/miner/start", {
                "threads": data.miner.Threads + 1
            });
        });
        ui.addListener("remove-miner", function() {
            httpApiCall("/miner/start", {
                "threads": data.miner.Threads - 1 < 0 ? 0 : data.miner.Threads - 1
            });
        });
        ui.addListener("toggle-mining", function() {
            if (data.miner.State == "Off") {
                httpApiCall("/miner/start", {
                    "threads": data.miner.Threads
                });
            } else {
                httpApiCall("/miner/stop");
            }
        });
        ui.addListener("stop-mining", function() {
            httpApiCall("/miner/stop");
        });
        ui.addListener("save-host-config", function(hostSettings) {
            console.log(hostSettings);
            httpApiCall("/host/config", hostSettings);
        });
        ui.addListener("send-money", function(info) {
            ui.wait();
            var address = info.to.address.replace(/[^A-Fa-f0-9]/g, "");
            httpApiCall("/wallet/send", {
                "amount": info.from.amount,
                "destination": address
            }, function(data) {
                updateWallet(function() {
                    ui.stopWaiting();
                    ui.switchView("manage-account");
                });
            });
        });
        ui.addListener("create-address", function() {
            ui.wait();
            httpApiCall("/wallet/address", {}, function(info) {
                createdAddressList.push({
                    "Address": info.Address,
                    "Balance": 0
                });
                updateWallet(function() {
                    ui.stopWaiting();
                });
            });
        });
        ui.addListener("download-file", function(fileNickname) {
            var savePath = ipc.sendSync("save-file-dialog");
            ui.notify("Downloading " + fileNickname + " to "+savePath+" folder", "download");
            httpApiCall("/renter/download", {
                "nickname": fileNickname,
                "destination": savePath
            });
        });
        ui.addListener("upload-file", function(filePath, nickName){
            ui.notify("Uploading " + nickName + " to Sia Network", "upload");
            httpApiCall("/renter/upload", {
                "source": filePath,
                "nickname": nickName,
            });
        });
        ui.addListener("announce-host", function(){
            httpApiCall("/host/announce", {}, function(data){
                ui.notify("Host successfully announced!", "success");
            });
        });
        ui.addListener("update-peers", function(peers) {
            ui.notify("Updating Network...", "peers");

            function addPeer(peerAddr) {
                httpApiCall("/peer/add", {
                    "address": peerAddr
                }, function() {
                    ui.notifySmall("Successfully added peer: " + peerAddr, "success");
                }, function(err) {
                    ui.notifySmall("Error adding peer: " + peerAddr, "error");
                });
            }

            function removePeer(peerAddr) {
                httpApiCall("/peer/remove", {
                    "address": peerAddr
                }, function() {
                    ui.notifySmall("Successfully removed peer: " + peerAddr, "success");
                }, function(err) {
                    ui.notifySmall("Error removing peer: " + peerAddr, "error");
                });
            }
            var oldPeers = data.peer.Peers;
            for (var i = 0; i < oldPeers.length; i++) {
                if (peers.indexOf(oldPeers[i]) == -1) {
                    // this peer has been removed
                    removePeer(oldPeers[i]);
                }
            }
            peers.forEach(function(peerAddr) {
                if (data.peer.Peers.indexOf(peerAddr) == -1) {
                    // This peer needs to be added
                    addPeer(peerAddr);
                }
            });
        });
    }

    var lastUpdateTime = Date.now();
    var lastBalance = 0;
    var runningIncomeRateAverage = 0;

    function updateWallet(callback) {
        $.getJSON(uiConfig.siad_addr + "/wallet/status", function(response) {
            data.wallet = {
                "Balance": response.Balance,
                "FullBalance": response.FullBalance,
                "USDBalance": util.USDConvert(response.Balance),
                "NumAddresses": response.NumAddresses,
                "DefaultAccount": "Main Account",
                "Accounts": [{
                    "Name": "Default",
                    "Balance": response.Balance,
                    "USDBalance": util.USDConvert(response.Balance),
                    "NumAddresses": response.NumAddresses,
                    "Addresses": createdAddressList,
                    "Transactions": []
                }]
            };
            updateUI();
            if (callback) callback();
            triggerListener("wallet");
        });
    }

    function updateMiner(callback) {
        $.getJSON(uiConfig.siad_addr + "/miner/status", function(response) {
            var timeDifference = (Date.now() - lastUpdateTime) * 1000;
            var balance = data.wallet ? data.wallet.Balance : 0;
            var balanceDifference = balance - lastBalance;
            var incomeRate = balanceDifference / timeDifference;
            runningIncomeRateAverage = (runningIncomeRateAverage * 1999 + incomeRate) / 2000;
            if (response.State == "Off") {
                runningIncomeRateAverage = 0;
            }
            data.miner = {
                "State": response.State,
                "Threads": response.Threads,
                "RunningThreads": response.RunningThreads,
                "Address": response.Address,
                "AccountName": "Main Account",
                "Balance": balance,
                "USDBalance": util.USDConvert(balance),
                "IncomeRate": runningIncomeRateAverage
            };
            lastBalance = balance;
            lastUpdateTime = Date.now();
            updateUI();
            if (callback) callback();
            triggerListener("miner");
        });
    }

    function updateHost(callback) {
        $.getJSON(uiConfig.siad_addr + "/host/status", function(response) {
            data.host = {
                "HostSettings": response
            };
            updateUI();
            if (callback) callback();
            triggerListener("host");
        }).error(function() {
            console.log(arguments);
        });
    }

    function updateFile(callback) {
        $.getJSON(uiConfig.siad_addr + "/renter/files", function(response) {
            data.file = {
                "Files": response || []
            };
            updateUI();
            if (callback) callback();
            triggerListener("file");
        }).error(function() {
            console.log(arguments);
        });
    }

    function updateConsensus(callback) {
        $.getJSON(uiConfig.siad_addr + "/consensus/status", function(response) {
            data.consensus = {
                "Height": response.Height,
                "CurrentBlock": response.CurrentBlock,
                "Target": response.Target
            };
            updateUI();
            if (callback) callback();
            triggerListener("consensus");
        }).error(function() {
            console.log(arguments);
        });
    }

    function updatePeer(callback) {
        $.getJSON(uiConfig.siad_addr + "/gateway/status", function(response) {
            data.peer = response;
            updateUI();
            if (callback) callback();
            triggerListener("peer");
        }).error(function() {
            console.log(arguments);
        });
    }

    function updateQueue(callback){
        data.downloadqueue = data.downloadqueue || [];
        $.getJSON(uiConfig.siad_addr + "/renter/downloadqueue", function(response) {
            data.downloadqueue = response;
            updateUI();
            if (callback) callback();
            triggerListener("downloadqueue");
        }).error(function() {
            console.log(arguments);
        });
    }

    function update() {
        updateWallet();
        updateMiner();
        updateHost();
        updateFile();
        updateConsensus();
        updatePeer();
        updateQueue();
    }

    function updateUI() {
        if (data.wallet && data.miner && data.host && data.file && data.consensus) {
            ui.update(data);
        }
    }

    function triggerListener(type){
        if (dataListeners[type]){
            dataListeners[type] = dataListeners[type].filter(function(callback){
                return !callback(data);
            });
        }
    }

    function addDataListener(type, callback){
        dataListeners[type] = dataListeners[type] || [];
        dataListeners[type].push(callback);
    }

    return {
        "init": init,
        "update": update,
        "addDataListener": addDataListener,
        "promptUserIfUpdateAvailable": promptUserIfUpdateAvailable
    };
})();
