ui._files = (function(){

    var view, eUploadFile, eFileBlueprint, eFiles, eSearch, eSearchBox;

    function init(){
        view = $("#files");
        eUploadFile = view.find(".upload-public");
        eFileBlueprint = view.find(".file.blueprint");
        eSearchBox = view.find(".search");
        eSearch = view.find(".search .text");
        eFiles = $();

        addEvents();
    }

    function addEvents(){
        eUploadFile.click(function(e){
            ui._uploadFile.setPrivacy("public");
            ui.switchView("upload-file");
        });
        eSearch.keydown(function(e){
            if (e.keyCode == 13){
                e.preventDefault();
            }
            updateFileList(lastLoadedFiles);
        });
        eSearchBox.click(function(e){
            eSearch.focus();
            updateFileList(lastLoadedFiles);
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
        eSearch[0].innerHTML = "";
    }

    function getSearchValue(){
        return eSearch[0].innerHTML;
    }

    function hashFileList(flist){
        flist = sortFileList(flist);
        return flist.map(function(file){
            return file.Nickname + file.Available.toString();
        }).join("");
    }

    function sortFileList(flist){
        return flist.sort(function(a,b){
            var sa = a.Nickname + a.Available.toString();
            var sb = b.Nickname + b.Available.toString();
            if (sa < sb) return -1;
            if (sb < sa) return 1;
            return 0;
        });
    }

    var th = 0;
    function fileListHasImportantChanges(a,b){
        // we only care about availability and names
        return hashFileList(a) != hashFileList(b);
    }

    function updateFileList(files){
        lastLoadedFiles = sortFileList(files);
        eFiles.remove();
        var newFileElements = [];
        var searchValue = getSearchValue();
        files.forEach(function(fileObject){
            var fileNickname = fileObject.Nickname;
            if (!searchValue || fileNickname.indexOf(searchValue)!=-1){
                var blocksRemaining = fileObject.TimeRemaining;
                var eFile = eFileBlueprint.clone().removeClass("blueprint");
                var available = fileObject.Available;
                eFile.find(".name").text(fileNickname);
                eFile.find(".size").text(" "); //TODO we can't get size ATM
                eFile.find(".time").text(blocksRemaining + "t"); //TODO this unit sucks
                if (fileObject.Repairing){
                    eFile.find(".graphic i").removeClass("fa-file").addClass("fa-wrench");
                }else{
                    eFile.find(".graphic i").removeClass("fa-wrench").addClass("fa-file");
                }
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
            }
        });
        eFiles = $(newFileElements);
    }

    return {
        init:init,
        update: update,
        onViewOpened: onViewOpened
    };
})();
