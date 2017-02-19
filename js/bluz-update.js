var bluzUpdate = function () {
    var lastFlashSuccessful;

    this.update = function(device, accessToken, files, callback) {
        var fileIndex = 0;

        var source = new EventSource("https://api.particle.io/v1/devices/" + device + "/events?access_token=" + accessToken);
        if(typeof(EventSource) !== "undefined") {
            console.log("SSE is Supported!");
        } else {
            console.log("SSE is NOT Supported");
        }
        source.addEventListener('spark/status', function(e){
            var obj = jQuery.parseJSON(e.data);
            if (obj.data == "online" && fileIndex < files.length && this.lastFlashSuccessful) {
                $.ajax({
                    type: "POST",
                    url: "https://update.bluz.io/update",
                    data: JSON.stringify({"device":device, "accessToken":accessToken,"files":[files[fileIndex++]]}),
                    contentType: "application/json; charset=utf-8",
                    success: function(response) { console.log("sent file: " + files[fileIndex-1]); },
                    error: function(xhr, ajaxOptions, thrownError) { console.log(xhr.responseText); }
                });
                this.lastFlashSuccessful = false;
            } else if (obj.data == "online" && fileIndex == files.length) {
                source.close();
                callback(true);
            }

        }, false);

        source.addEventListener('spark/flash/status', function(e){
            var obj = jQuery.parseJSON(e.data);
            if (obj.data.trim() == "failed") {
                source.close();
                callback(false);
            } else if (obj.data.trim() == "success") {
                this.lastFlashSuccessful = true;
            }

        }, false);

        $.ajax({
            type: "POST",
            url: "https://update.bluz.io/update",
            data: JSON.stringify({"device":device, "accessToken":accessToken,"files":[files[fileIndex++]]}),
            contentType: "application/json; charset=utf-8",
            success: function(response) { console.log("sent file: " + files[fileIndex-1]); },
            error: function(xhr, ajaxOptions, thrownError) { console.log(xhr.responseText); }
        });
        this.lastFlashSuccessful = false;

    }

    this.checkStatus = function(id) {

    }
};