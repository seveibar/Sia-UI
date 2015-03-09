ui._about = (function(){

    var view;

    function init(){
        view = $("#about");

        addEvents();
    }

    function addEvents(){
    }

    function update(data){
    }

    function onViewOpened(data){
        console.log("yyoyoyoyoyoy", data.Version);
        view.find("#siaversion").text(data.Version);
    }

    return {
        "init": init,
        "update": update,
        "onViewOpened": onViewOpened
    };

})();
