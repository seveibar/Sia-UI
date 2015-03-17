// ui module
// Handles displaying data to UI, user interaction events and changing views,
// basically any interaction with the page should run through UI

// Calling ui.help("<function name>") will give parameter information
// the help will also be displayed if the parameters are given incorrectly

// The UI will get updates to it's data from TODO (external module), update it's
// data object, then calls update(data); on all views.

// To see what the data format looks like, look at the ui._data object from within
// the console

var ui = (function(){

    var currentView = "overview";
    var viewNames = ["overview", "money", "manage-account", "files", "hosting", "mining", "transfer-funds", "upload-file", "network","about"];
    var transitionTypes = {
        "money->manage-account": "slideleft",
        "manage-account->money": "slideright",
        "manage-account->transfer-funds": "slideleft",
        "transfer-funds->manage-account": "slideright",
        "files->upload-file": "slideleft",
        "upload-file->files": "slideright"
    };
    var eTooltip;
    var eventListeners = {};

    function switchView(newView){
        // Check that parameter is specified
        if (!newView){
            console.error(help("switchView"));
            return;
        }

        // Check that the new view isn't the old view
        if (newView == currentView){
            return;
        }

        // Check if view is valid
        if (viewNames.indexOf(newView) === -1){
            console.error(newView + " is not a valid view");
            return;
        }

        // Refresh the new view's data
        if (ui["_" + newView].update) ui["_" + newView].update(ui._data);

        // Call the onViewOpened event if the view has it
        if (ui["_" + newView].onViewOpened) ui["_" + newView].onViewOpened(ui._data);

        // Make the currently selected button greyed
        $("#sidebar .current").removeClass("current");
        $("." + newView + "-button").addClass("current");

        // Get the animation for the change
        var transitionType = transitionTypes[currentView + "->" + newView] || "load";

        if (transitionType == "load"){
            // Play a dummy loading animation (we may need the time later)
            startLoadingAnimation({
                "fade": true,
                "loader":false,
                "fadeTime": 200
            });
            setTimeout(function(){
                stopLoadingAnimation(newView, {
                    "fade":true,
                    "fadeTime":200
                });
            },200);
            // $("#" + currentView).hide();
            // $("#" + newView).show();
            // currentView = newView;
        }else if (transitionType == "slideright"){
            slideAnimation(newView, "right");
        }else if (transitionType == "slideleft"){
            slideAnimation(newView, "left");
        }else{
            console.error("Invalid transition type specified");
        }

    }

    function startLoadingAnimation(effects){
        if (!effects) effects = {fade:true};
        // Position rotating loader icon in center of content
        $("#loader").css({
            "left": $("#content").width()/2 - $("#loader").width()/2,
            "top": "250px"
        });

        if (effects.fade){
            effects.fadeTime = effects.fadeTime || 400;
            // Animate the loader in
            if (effects.loader !== false){
                $("#loader").stop().fadeIn(effects.fadeTime);
            }

            // Make all content (excluding the loader) non-visible
            var pages = $("#content").children().filter(function(i){
                return this != $("#loader")[0];
            });

            // Animate the old header up
            // TODO animating all headers rn, but only the current header should
            // move up
            pages.find(".header > *").stop().css({"ytranslation": 0});
            pages.find(".header > *").animate({
                "ytranslation": 1
            },{
                step:function(t){
                    $(this).css({"opacity": 1-t});
                },
                duration:effects.fadeTime
            });

            var pageContents = pages.children().not(".header");

            pageContents.stop().fadeOut(effects.fadeTime);
            setTimeout(function(){
                pages.hide();
            }, effects.fadeTime);
        }else{
            $("#loader").stop().show();
        }
    }

    function stopLoadingAnimation(newView,effects){
        if (!effects) effects = {fade:true};
        currentView = newView;

        if (effects.fade){
            effects.fadeTime = effects.fadeTime || 400;
            $("#loader").stop().fadeOut(effects.fadeTime);

            // Animate the header up
            $("#" + newView).find(".header > *").stop().css({"ytranslation": 0});
            $("#" + newView).find(".header > *").animate({
                "ytranslation": 1
            },{
                step:function(t){
                    $(this).css({"opacity": t});
                },
                duration:effects.fadeTime
            });

            $("#" + newView).children().not(".header").stop().fadeIn(effects.fadeTime);
            $("#" + newView).show();
        }else{
            $("#loader").stop().hide();
        }
    }

    function slideAnimation(newView, directionString){

        // Utility functions
        function setTranslate(element, x, y){
            element.css({
                "-webkit-transform": "translate(" + x + "px," + y + "px)",
                "transform": "translate(" + x + "px," + y + "px)",
                "-moz-transform": "translate(" + x + "px," + y + "px)"
            });
        }

        function clearTransform(element){
            element.css({
                "-webkit-transform": "",
                "-moz-transform": "",
                "transform": ""
            });
        }


        // Show the new view (off to the side)
        $("#" + newView).show();

        var newElement = $("#" + newView);
        var oldElement = $("#" + currentView);

        // To avoid movement upon removal
        newElement.before(oldElement);
        newElement.find(".header > *").stop().css({"opacity":1});
        newElement.children().not(".header").stop().show().css({"opacity":1});

        var slideDistance = oldElement.width();
        var heightDifference = oldElement.offset().top - newElement.offset().top;

        newElement.css({"animationProgress":0});
        newElement.animate({animationProgress:1},{
            duration:400,
            step: function(v){
                // Prevent tooltips from being spawned
                eTooltip.stop().hide();
                clearTimeout(tooltipTimeout);

                // Translate views
                if (directionString == "right"){
                    setTranslate(newElement, slideDistance * (v- 1),heightDifference);
                    setTranslate(oldElement, slideDistance * v, 0);
                }else{
                    setTranslate(newElement, slideDistance * (1-v), heightDifference);
                    setTranslate(oldElement, slideDistance * -v,0);
                }
            },
            complete:function(){
                // When the animation is done, clear the transformations and
                // make the current view the primary view
                clearTransform(oldElement);
                clearTransform(newElement);
                oldElement.hide();
                currentView = newView;
            }
        });
    }

    function help(functionName){
        if (!functionName) console.error("help(<function name>)");
        return {
            "switchView": "switchView(<string newView>) \
            \nPossible Views: " + viewNames.join(", "),
            "update": "update(<json data object>) \
            \nData object generated from requests from server, see top of ui.js",
            "addListener": "addListener(<string event>, <function callback>)\
            \nAdd listener when a ui event occurs",
            "wait": "wait()\
            \nShows loading icon until stopWaiting() is called",
            "stopWaiting": "stopWaiting()\
            \nAllows user to continue using UI after wait() call",
            "notify": "notify(<string message>, <string type>, <clickCallback function>)\
            \nCreates notification. types are ['alert','update','help','sent','received','fix']",
            "notifySmall": "notifySmall(<see notify>)\
            \nCreates smaller notification"
        }[functionName];
    }

    function init(){
        // Hide everything but the "overview" view
        $("#content").children().filter(function(i){
            return this != $("#overview")[0];
        }).hide();

        // Add click listeners to buttons
        viewNames.forEach(function(view){
            $("." + view + "-button").click(function(){
                switchView(view);
            });
        });

        eTooltip = $("#tooltip");

        queueHandler.init();
        initViews();
    }

    function initViews(){
        ui._header.init();
        viewNames.forEach(function(view){
            ui["_" + view].init();
        });
    }

    function update(data){
        viewNames.forEach(function(view){
            if (ui["_" + view].update) ui["_" + view].update(data);
        });
        ui._data = data;
    }

    function wait(){
        startLoadingAnimation({fade:false});
    }

    function stopWaiting(){
        if (ui["_" + currentView].onViewOpened) ui["_" + currentView].onViewOpened(ui._data);
        stopLoadingAnimation(currentView,{fade:false});
    }

    // Triggers an event, many ui actions cause triggers
    function _trigger(event){
        console.log("Event Triggered:",event);
        var callbacks = eventListeners[event] || [];
        for (var i = 0;i < callbacks.length;i++){
            // Convert the arguments to trigger to an array so we can slice off
            // the first parameter (event)
            var argumentArray = Array.prototype.slice.call(arguments);
            callbacks[i].apply(this, argumentArray.slice(1,arguments.length));
        }
    }

    // Shows tooltip with content on given element
    var tooltipTimeout,tooltipVisible;
    function _tooltip(element, content, offset){
        offset = offset || {top:0,left:0};
        element = $(element);
        eTooltip.show();
        eTooltip.html(content);
        var middleX = element.offset().left + element.width()/2;
        var topY = element.offset().top - element.height();
        eTooltip.offset({
            top: topY - eTooltip.height() + offset.top,
            left: middleX - eTooltip.width()/2 + offset.left
        });
        if (!tooltipVisible){
            eTooltip.stop();
            eTooltip.css({"opacity":0});
            tooltipVisible = true;
            eTooltip.animate({
                "opacity":1
            },400);
        }else{
            eTooltip.stop();
            eTooltip.show();
            eTooltip.css({"opacity":1});
        }
        clearTimeout(tooltipTimeout);
        tooltipTimeout = setTimeout(function(){
            // eTooltip.hide();
            eTooltip.animate({
                "opacity":"0"
            },400,function(){
                tooltipVisible = false;
                eTooltip.hide();
            });
        },1400);
    }

    var notifications = [];
    var lastNotificationTime = 0;
    var notificationsInQueue = 0;
    var notificationIcons = {
        "alert": "exclamation",
        "error": "exclamation",
        "update": "arrow-circle-o-up",
        "upload": "upload",
        "help": "question",
        "sent": "send",
        "received": "sign-in",
        "fix": "wrench",
        "download": "arrow-circle-down",
        "peers": "group",
        "success": "check"
    };
    function notifySmall(message, type, clickAction){
        notify(message, type, clickAction, true);
    }
    function notify(message, type, clickAction, small){

        // CONTRIBUTE: This delay system is technically broken, but not noticably
        // wait approximately 250ms between notifications
        if (new Date().getTime() < lastNotificationTime + 250){

            notificationsInQueue ++;

            setTimeout(function(){
                notify(message, type, clickAction, small);
            }, notificationsInQueue * 250);

            return;
        }

        lastNotificationTime = new Date().getTime();
        if (notificationsInQueue > 0){
            notificationsInQueue --;
        }

        showNotification(message, type, clickAction, small);
    }
    function addDownloadQueueItem(filename){
        var element = $(".downloadqueue.blueprint").clone().removeClass("blueprint");
        element.find(".filename").text(filename);
        element.click(function(){
            element.slideUp(function(){
                element.remove();
            });
        });
        element.css("opacity",0);
        element.animate({
            "opacity":1
        });
        $(".notification-container").append(element);

        return {
            "updateName": function(filename){
                element.find(".filename").text(filename);
            },
            "updateProgress": function(amt){
                element.find(".bar").css("width", (amt*100) + "%");
            },
            "remove": function(){
                element.remove();
            }
        };
    }

    function showNotification(message, type, clickAction, small){
        type = type || "alert";

        var element = $(".notification.blueprint").clone().removeClass("blueprint");
        element.find(".icon i").addClass("fa-" + notificationIcons[type]);
        element.addClass("type-" + type);
        if (small){
            element.addClass("small");
        }
        element.find(".content").text(message);
        element.css({"opacity":0});
        $(".notification-container").prepend(element);
        if (clickAction){
            element.addClass("hoverable");
            element.click(clickAction);
        }

        // Removes the notification element
        function removeElement(){
            element.slideUp(function(){
                element.remove();
            });
        }

        var removeTimeout;
        element.mouseover(function(){
            // don't let the notification disappear if the user is debating
            // clicking
            clearTimeout(removeTimeout)
        });

        element.mouseout(function(){
            // the user isn't interested, restart deletion timer
            removeTimeout = setTimeout(removeElement, 2500);
        })

        element.animate({
            "opacity":1
        });
        removeTimeout = setTimeout(removeElement, 4000);
    }

    function addListener(event, callback){
        eventListeners[event] = eventListeners[event] || [];
        eventListeners[event].push(callback);
    }

    function removeListener(event, callback){
        eventListeners[event] = eventListeners[event].filter(function(listener){
            return listener != callback;
        });
    }

    return {
        "switchView": switchView,
        "update": update,
        "addListener": addListener,
        "addDownloadQueueItem": addDownloadQueueItem,
        "wait": wait,
        "stopWaiting": stopWaiting,
        "notify": notify,
        "notifySmall": notifySmall,
        "_tooltip": _tooltip,
        "_trigger": _trigger,
        "_data": null,
        "help": help,
        "init": init
    };
})();
