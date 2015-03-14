ui._hosting = (function(){

    var view, ePropBlueprint, ePreset16GB, ePreset32GB, ePreset64GB, eProps, eControl, eSave, eReset;


    var hostProperties = [
        {
            "name": "TotalStorage",
            "unit": "MB",
            "conversion": 1/1000/1000
        },{
            "name": "MinFilesize",
            "unit": "KB",
            "conversion": 1/1000
        },{
            "name": "MaxFilesize",
            "unit": "KB",
            "conversion": 1/1000
        },{
            "name": "MinDuration",
            "unit": "Day",
            "conversion": 10/60/24
        },{
            "name": "MaxDuration",
            "unit": "Day",
            "conversion": 10/60/24
        },{
            "name": "Price",
            "unit": "SC",
            "conversion": 1/util.siaConversionFactor
        },{
            "name": "Collateral",
            "unit": "SC",
            "conversion": 1/util.siaConversionFactor
        }
    ];

    // TODO: don't generate these, just use hostProperties
    var editableProps = hostProperties.map(function(obj){
        return obj["name"];
    });
    var propUnits = hostProperties.map(function(obj){
        return obj["unit"];
    });
    var propConversion = hostProperties.map(function(obj){
        return obj["conversion"];
    });
    var lastHostSettings;

    function init(){

        view = $("#hosting");

        ePropBlueprint = view.find(".property.blueprint");
        ePreset16GB = view.find(".preset1");
        ePreset32GB = view.find(".preset2");
        ePreset64GB = view.find(".preset3");
        eControl = view.find(".control");
        eProps = $();
        eSave = view.find(".control .save");
        eReset = view.find(".control .reset");

        addEvents();
    }

    function addEvents(){
        ePreset16GB.click(function(){
            ui._tooltip(this, "Not Implemented");
        });
        ePreset32GB.click(function(){
            ui._tooltip(this, "Not Implemented");
        });
        ePreset64GB.click(function(){
            ui._tooltip(this, "Not Implemented");
        });
        eSave.click(function(){
            ui._tooltip(this, "Saving");
            ui._trigger("save-host-config", parseHostSettings());
        });
        eReset.click(function(){
            ui._tooltip(this, "Reseting");
            for (var i = 0;i < editableProps.length;i ++){
                var item = $(eProps[i]);
                var value = parseFloat(ui._data.host.HostSettings[editableProps[i]]);
                item.find(".value").text(value * propConversion[i]);
            }
        });
    }

    function parseHostSettings(){
        var newSettings = {};
        for (var i = 0;i < editableProps.length;i ++){
            var item = $(eProps[i]);
            var value = parseFloat(item.find(".value").text());
            newSettings[editableProps[i].toLowerCase()] = value / propConversion[i];
        }
        return newSettings;
    }

    function onViewOpened(data){
        eProps.remove();
        // If this is the first time, create and load all properties
        for (var i = 0; i < editableProps.length; i++){
            var item = ePropBlueprint.clone().removeClass("blueprint");
            ePropBlueprint.parent().append(item);
            eProps = eProps.add(item);
            item.find(".name").text(editableProps[i] + " ("+ propUnits[i] +")");
            var value = parseFloat(data.host.HostSettings[editableProps[i]]);
            item.find(".value").text(value * propConversion[i]);
        }

    }

    return {
        init:init,
        onViewOpened:onViewOpened
    };
})();
