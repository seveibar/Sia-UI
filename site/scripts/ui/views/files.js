ui._files = (function(){

    var view, eUploadFile, eFileBlueprint, eFiles;

    function init(){
        view = $("#files");
        eUploadFile = view.find(".upload-public");
        eFileBlueprint = view.find(".file.blueprint");
        eFiles = $();

        addEvents();
    }

    function addEvents(){
        eUploadFile.click(function(e){
            ui._uploadFile.setPrivacy("public");
            ui.switchView("upload-file");
        });
    }

    var lastLoadedFiles = [];
    function update(data){
        if (data.file.Files && fileListHasImportantChanges(data.file.Files, lastLoadedFiles)){
            updateFileList(data.file.Files);
        }
    }

    function onViewOpened(data){
        if (data.file.Files){
            updateFileList(data.file.Files);
        }
    }

    function hashFileList(flist){
        sortFileList(flist);
        return flist.reduce(function(acc, file){
            return acc + file.Nickname + file.Available.toString();
        }, "");
    }

    function sortFileList(flist){
        return flist.sort(function(a,b){
            return a.Nickname + a.Available.toString() < b.Nickname + b.Available.toString()
        });
    }

    function fileListHasImportantChanges(a,b){
        // we only care about availability and names
        return hashFileList(a) != hashFileList(b);
    }

    function updateFileList(files){
        lastLoadedFiles = files;
        eFiles.remove();
        var newFileElements = [];
        files.forEach(function(fileObject){
            var fileNickname = fileObject.Nickname;
            var blocksRemaining = fileObject.TimeRemaining;
            var eFile = eFileBlueprint.clone().removeClass("blueprint");
            var available = fileObject.Available;
            eFile.find(".name").text(fileNickname);
            eFile.find(".size").text(" "); //TODO we can't get size ATM
            eFile.find(".time").text(blocksRemaining + " Blocks Remaining"); //TODO we can't get size ATM
            if (available){
                eFile.find(".available").find(".yes").show();
                eFile.find(".available").find(".no").hide();
            }else{
                eFile.find(".available").find(".yes").hide();
                eFile.find(".available").find(".no").show();
            }
            eFileBlueprint.parent().append(eFile);
            newFileElements.push(eFile[0]);
            eFile.click(function(){
                ui._trigger("download-file", fileNickname);
            });
        });
        eFiles = $(newFileElements);
    }

    return {
        init:init,
        update: update,
        onViewOpened: onViewOpened
    };
})();
