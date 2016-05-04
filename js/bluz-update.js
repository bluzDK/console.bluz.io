var bluzUpdate = function () {
    this.update = function(device, accessToken, files) {
        var fileIndex = 0;

        var source = new EventSource("https://api.particle.io/v1/devices/" + device + "/events?access_token=" + accessToken);
        if(typeof(EventSource) !== "undefined") {
            console.log("SSE is Supported!");
        } else {
            console.log("SSE is NOT Supported");
        }
        source.addEventListener('spark/status', function(e){
            var obj = jQuery.parseJSON(e.data);
            if (obj.data == "online" && fileIndex < files.length) {
                $.ajax({
                    type: "POST",
                    url: "https://update.bluz.io/update/",
                    data: JSON.stringify({"device":device, "accessToken":accessToken,"files":[files[fileIndex++]]}),
                    contentType: "application/json; charset=utf-8",
                    success: function(response) { console.log("subsequent file sent"); },
                    error: function(xhr, ajaxOptions, thrownError) { console.log(xhr.responseText); }
                });
            } else if (obj.data == "online" && fileIndex == files.length) {
                source.close();
            }

        }, false);

        $.ajax({
            type: "POST",
            url: "https://update.bluz.io/update/",
            data: JSON.stringify({"device":device, "accessToken":accessToken,"files":[files[fileIndex++]]}),
            contentType: "application/json; charset=utf-8",
            success: function(response) { console.log("first file sent"); },
            error: function(xhr, ajaxOptions, thrownError) { console.log(xhr.responseText); }
        });

    }

    this.checkStatus = function(id) {

    }
};