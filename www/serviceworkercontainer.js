var exec = require('cordova/exec');
var $q = require('com.google.fauxserviceworker.Q');

var ServiceWorkerContainer = {
    register:function(scriptUrl, options) {
        console.log("register: " + JSON.stringify(arguments));
        //exec(null, null, "ServiceWorker", "containerRegister", []);
        var scope = options && options.scope;
        return $q.fcall(function() { return new ServiceWorkerRegistration(document, scriptUrl, scope); });
    }
};

module.exports = ServiceWorkerContainer;
