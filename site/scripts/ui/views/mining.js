ui._mining = (function(){

    var view, eMiningStatus, eIncomeRate, eActiveMiners, eActiveMinerCount, eAddMiner,
        eRemoveMiner, eToggleMining, eAccountName, eBalance;

    function init(){
        view = $("#mining");
        eMiningStatus = view.find(".mining-status");
        eIncomeRate = view.find(".income-rate");
        eActiveMiners = view.find(".active-miners");
        eActiveMinerCount = view.find(".miner-control .display .number");
        eAddMiner = view.find(".add-miner");
        eRemoveMiner = view.find(".remove-miner");
        eToggleMining = view.find(".toggle-mining");
        eAccountName = view.find(".account-name");
        eBalance = view.find(".account-info .amt");

        addEvents();
    }

    function addEvents(){
        eMiningStatus.click(function(){
            ui._tooltip(eMiningStatus, "Toggling Mining");
            ui._trigger("toggle-mining");
        });
        eAddMiner.click(function(){
            ui._tooltip(this, "Adding Miner");
            ui._trigger("add-miner");
        });
        eRemoveMiner.click(function(){
            ui._tooltip(this, "Removing Miner");
            ui._trigger("remove-miner");
        });
        eToggleMining.click(function(){
            if (eToggleMining.find(".text").text() == "Stop Mining"){
                ui._tooltip(this, "Stopping Miners");
            }else{
                ui._tooltip(this, "Starting Miners");
            }
            ui._trigger("toggle-mining");
        });
    }

    function update(data){
        var minerOn = data.miner.State == "Off" ? false : true;
        if (data.miner.Threads < 1){
            minerOn = false;
        }

        if (!minerOn){
            eMiningStatus.text("Mining Off");
            eMiningStatus.removeClass("enabled");
            eMiningStatus.addClass("disabled");
            eActiveMiners.text("No Active Threads");
            eToggleMining.find(".fa-remove").hide();
            eToggleMining.find(".fa-legal").show();
            eToggleMining.find(".text").text("Start Mining");
        }else{
            eMiningStatus.text("Mining On");
            eMiningStatus.removeClass("disabled");
            eMiningStatus.addClass("enabled");
            eActiveMiners.text(data.miner.RunningThreads + " Active Threads");
            eToggleMining.find(".fa-remove").show();
            eToggleMining.find(".fa-legal").hide();
            eToggleMining.find(".text").text("Stop Mining");
        }

        eActiveMinerCount.text(data.miner.RunningThreads);
        eIncomeRate.html(util.fsiacoin(data.miner.IncomeRate) + "/s");

        eAccountName.text(data.miner.AccountName);

        eBalance.text(util.fsiacoin(data.miner.Balance));

    }

    return {
        init:init,
        update:update
    };
})();
