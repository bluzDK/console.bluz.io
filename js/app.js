var accessToken, myDevices, latestFirmware;
var particle = new Particle();
var bluzUpdate = new bluzUpdate();

var waiting = function(waiting) {
    if (waiting) {
        $("body").addClass("loading");
    } else {
        $("body").removeClass("loading");
    }
}

var isGatewayClaimed = function(deviceID) {
    var found = false;
    myDevices.forEach(function(device) {
        if (device.id===deviceID) {
            found = true;
        }
    });
    return found;
}

var claimDevice = function(button, deviceID) {
    particle.claimDevice({ deviceId: deviceID, auth: accessToken }).then(function(data) {
        console.log('device claim data:', data);
        toastr.success('Successfully claimed device');
        $(button).hide();
    }, function(err) {
        console.log('device claim err:', err);
        toastr.error('Unable to claim device: ' + err.errorDescription);
    });
}

var updateDevice = function(button, deviceID) {

    $("#update-modal").modal()
    bluzUpdate.update(deviceID, accessToken, ['http://console.bluz.io/firmware/latest/system-part1.bin', 'http://console.bluz.io/firmware/latest/tinker.bin']);
    toastr.success('Update Started');
    $(button).hide();
}

var parseDeviceAttributesForGateways = function(device, data) {
    if (data.body.variables != null && data.body.variables.hasOwnProperty('gatewayID')) {
        particle.getVariable({ deviceId: device.id, name: 'gatewayID', auth: accessToken }).then(function(data) {
            console.log('Device variable retrieved successfully:', data);
            var deviceID = data.body.result.substring(0, 24);

            //build the html for each gateway device
            var html = '<tr><td align="center">';
            if (data.body.coreInfo.product_id == 0) {
                //Core
                html = html.concat('<img src="img/gw_photon.png" class="img-responsive" width="300"/>');
            } else if (data.body.coreInfo.product_id == 6) {
                //Photon
                html = html.concat('<img src="img/gw_photon.png" class="img-responsive" width="300"/>');
            } else if (data.body.coreInfo.product_id == 8) {
                //P1, meaning Gateway
                html = html.concat('<img src="img/gateway.png" class="img-responsive" width="300"/>');
            } else if (data.body.coreInfo.product_id == 10) {
                //Electron
                html = html.concat('<img src="img/gw_electron.png" class="img-responsive" width="300"/>');
            }
            html = html.concat('<p>' + deviceID + '</p>');

            if (!isGatewayClaimed(deviceID)) {
                html = html.concat('<button class="claim-button" onclick="claimDevice(this, \'' + deviceID + '\')">Claim</button>');
                html = html.concat('</td></tr>');
                //now append the html
                $('#gateway-list tr:last').after(html);
            } else {
                var version = "1.0.47";

                particle.getDevice({ deviceId: deviceID, auth: accessToken }).then(
                    function(data){
                        console.log('Device attrs retrieved successfully:', data);
                        if (data.body.variables != null && data.body.variables.hasOwnProperty('version')) {
                            particle.getVariable({ deviceId: deviceID, name: 'version', auth: accessToken }).then(function(data) {
                                var deviceVersion = data.body.result;
                                if (deviceVersion != latestFirmware) {
                                    html = html.concat('<button class="update-button" onclick="updateDevice(this, \'' + deviceID + '\')">Update</button>');
                                }
                                html = html.concat('</td></tr>');
                                //now append the html
                                $('#gateway-list tr:last').after(html);
                            });
                        } else {
                            //legacy. the first firmware didn't have this variable
                            html = html.concat('<button class="update-button" onclick="updateDevice(this, \'' + deviceID + '\')">Update</button>');
                            html = html.concat('</td></tr>');
                            //now append the html
                            $('#gateway-list tr:last').after(html);
                        }
                    },
                    function(err) {
                        console.log('API call failed: ', err);
                    }
                );
            }
        }, function(err) {
            console.log('An error occurred while getting attrs:', err);
        });
    }
}

var parseDevicesForGateways = function(devices) {
    var deviceCounter = 0;
    devices.body.forEach(function(device) {
        var devicesPr = particle.getDevice({ deviceId: device.id, auth: accessToken });

        devicesPr.then(
            function(data){
                console.log('Device attrs retrieved successfully:', data);
                parseDeviceAttributesForGateways(device, data);
                deviceCounter++;
                if (deviceCounter == devices.body.length) { waiting(false); }
            },
            function(err) {
                console.log('API call failed: ', err);
                deviceCounter++;
                if (deviceCounter == devices.body.length) { waiting(false); }
            }
        );
    });
}

var listDevices = function() {
    var devicesPr = particle.listDevices({ auth: accessToken });

    devicesPr.then(
        function(devices){
            console.log('Devices: ', devices);
            myDevices = devices.body;
            parseDevicesForGateways(devices);
        },
        function(err) {
            console.log('List devices call failed: ', err);
        }
    );
}

var loginClicked = function() {
    $('#spark-login-form-error').hide();

    var user = $('#spark-login-form-email').val();
    var pass = $('#spark-login-form-password').val();

    particle.login({username: user, password:  pass}).then(
        function(data){
            console.log('API call completed on promise resolve: ', data.body.access_token);
            accessToken = data.body.access_token;
            $('.spark-login-modal').hide();
            waiting(true);
            listDevices();
        },
        function(err) {
            $('#spark-login-form-error').show();
            console.log('API call completed on promise fail: ', err);
        }
    );
    $.getJSON( "/firmware/latest/version.json", function( data ) {
        console.log("Newest Firmware Is: " + data.version);
        latestFirmware = data.version;
    });
}