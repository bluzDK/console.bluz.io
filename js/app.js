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
    if (deviceID == "No gateway detected yet.") {
        return true;
    }
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

var updateDevice = function(row, button, deviceID) {
    $(row).fadeTo(1000, 0.4);
    $("#update-modal").modal();
    bluzUpdate.update(deviceID, accessToken, ['http://staging-console.bluz.io/firmware/latest/bluz_gateway.bin', 'http://staging-console.bluz.io/firmware/latest/system-part1.bin'], function(success) {
        if (success) {
            toastr.success('Update Completed Successfully');
        } else {
            toastr.error('Error updating. Please try again.');
            $(button).show();
        }
        $(row).fadeTo(1000, 1);
    });
    toastr.info('Update Started');
    $(button).hide();
}

var gatewayAppDevice = function(row, button, deviceID) {
    $(row).fadeTo(1000, 0.4);
    $("#gateway-update-modal").modal();
    bluzUpdate.update(deviceID, accessToken, ['https://raw.githubusercontent.com/bluzDK/particle-gateway-shield-code/master/particle-gateway-code/particle-gateway-code.ino'], function(success) {
        if (success) {
            toastr.success('Loaded Gateway App Successfully');
            waiting(true);
            listDevices();
        } else {
            toastr.error('Error loading gateway app. Please try again.');
            $(button).show();
        }
        $(row).fadeTo(1000, 1);
    });
    toastr.info('Update Started');
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
                html = html.concat('<img src="img/gw_core.png" class="img-responsive" width="300"/>');
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
                                    html = html.concat('<button class="update-button" onclick="updateDevice(this.parentElement.parentElement, this, \'' + deviceID + '\')">Update</button>');
                                }
                                html = html.concat('</td></tr>');
                                //now append the html
                                $('#gateway-list tr:last').after(html);
                            });
                        } else {
                            //legacy. the first firmware didn't have this variable
                            html = html.concat('<button class="update-button" onclick="updateDevice(this.parentElement.parentElement, this, \'' + deviceID + '\')">Update</button>');
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
    } else if (device.connected == true && (device.product_id == 0 || device.product_id == 6 || device.product_id == 10)) {
        var html = '<tr><td align="center">';
        if (device.product_id == 0) {
            //Core
            html = html.concat('<img src="img/core.png" height="80"/>');
        } else if (device.product_id == 6) {
            //Photon
            html = html.concat('<img src="img/photon.png" height="80"/>');
        } else if (device.product_id == 10) {
            //Electron
            html = html.concat('<img src="img/electron.png" height="80"/>');
        }
        html = html.concat('<p>' + device.id + '</p><p>' + device.name + '</p>');

        html = html.concat('<button class="gateway-app-button" onclick="gatewayAppDevice(this.parentElement.parentElement, this, \'' + device.id + '\')">Load Gateway App</button>');
        html = html.concat('</td></tr>');
        //now append the html
        // $('#non-gateway-list tr:last').after(html);
    }
}

var parseDevicesForGateways = function(devices) {
    var deviceCounter = 0;
    devices.body.forEach(function(device) {
        if (device.connected) {
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
        }
        else {deviceCounter++;}
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
            waiting(false);
            $('.spark-login-modal').show();
            $('#spark-login-form-error').show();
            $('#gateway-list tr:last').html();
            localStorage.removeItem("accessToken");
        }
    );
}

var loggedIn = function() {
    $('.spark-login-modal').hide();
    $('#gateway-list tr:last').before('<h2>Gateways</h2>');
    // $('#non-gateway-list tr:last').before('<h2>Non-Gateways</h2>');
    waiting(true);
    listDevices();
}

var loginClicked = function() {

    $('#spark-login-form-error').hide();

    var user = $('#spark-login-form-email').val();
    var pass = $('#spark-login-form-password').val();

    particle.login({username: user, password:  pass}).then(
        function(data){
            console.log('API call completed on promise resolve: ', data.body.access_token);
            accessToken = data.body.access_token;
            localStorage.setItem("accessToken", accessToken);
            loggedIn();
        },
        function(err) {
            waiting(false);
            $('#spark-login-form-error').show();
            console.log('API call completed on promise fail: ', err);
        }
    );
    $.getJSON( "/firmware/latest/version.json", function( data ) {
        console.log("Newest Firmware Is: " + data.version);
        latestFirmware = data.version;
    });
}

$(document).ready(function() {
    // try and use local storage if possible
    if (typeof(Storage) !== "undefined") {
        // Code for localStorage/sessionStorage.
        storedAccessToken = localStorage.getItem("accessToken");
        if (storedAccessToken != null) {
            accessToken = storedAccessToken;
            loggedIn();
        }
    }
    
    $('#login-form').keypress(function (e) {

        if (e.which == 13) // enter key
            loginClicked();
    }.bind(this));
});