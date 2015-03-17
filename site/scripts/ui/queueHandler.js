
// Manages download queue

var queueHandler = (function(){

    var queue = [];

    function init(){
        controller.addDataListener("downloadqueue", queueUpdated);
    }

    function fileInQueue(file){
        for (var i = 0;i < queue.length;i++){
            if (file.Nickname + file.Destination == queue[i].id){
                return queue[i];
            }
        }
        return null;
    }

    function queueUpdated(data){
        data.downloadqueue.forEach(function(item){
            var queueItem = fileInQueue(item);
            if (!queueItem && !item.Complete){
                queueItem = {
                    "id": item.Nickname + item.Destination,
                    "Nickname": item.Nickname,
                    "uiOps": ui.addDownloadQueueItem(item.Nickname),
                    "progress":0,
                    "complete":false
                };
                queue.push(queueItem);
            }else if (queueItem){
                if (!item.Complete){
                    var progress = item.Received / item.Filesize;
                    if (queueItem.progress != progress){
                        queueItem.progress = progress;
                        queueItem.uiOps.updateProgress(progress);
                    }
                }else if (!queueItem.complete){
                    queueItem.complete = true;
                    queueItem.uiOps.updateProgress(1);
                    queueItem.uiOps.updateName("Complete: " + queueItem.Nickname)
                }
            }
        });
    }

    return {
        "init": init
    };
})();
