var exec = require('cordova/exec');
var $q = require('com.google.fauxserviceworker.Q');

var ServiceWorkerRegistration = function(doc, scriptURL, scope) {
    this.active = null;
    this.waiting = null;
    this.installing = null;
    this.scope = scope;
    this.registeringUrl = doc && doc.location && doc.location.href;
    this.uninstalling = false;
    console.log("Created");
    return Update.call(this, scriptURL);
};

var RegistrationQueue = [];
var InstallationQueue = [];
var InstallationResultHandleQueue = [];

var LoadContent = function(url) {
  console.log("Starting load for " + url);
  var defer = $q.defer();

  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.responseType = 'blob';

  xhr.onload = function() {
console.log("XHR Good");
    defer.resolve(xhr.response);
  };

  xhr.onerror = function(err) {
console.log("XHR Failed");
    defer.reject(new Error(err));
  };

  xhr.send();
  return defer.promise;
};

var Update = function(scriptURL) {
  console.log("Starting Update algorithm");
  var registration = this;
  var defer = $q.defer();
  var timeStamp = Date.now();
  RegistrationQueue.push(timeStamp);
  InstallationQueue.push(timeStamp);
  InstallationResultHandleQueue.push(timeStamp);

  var scripts = [];

  // Load the worker script
  LoadContent('poly.js').then(function(scriptBlob) {
    scripts.push(scriptBlob);
    return LoadContent('q.js');
  }).then(function(scriptBlob) {
    scripts.push(scriptBlob);
    return LoadContent(scriptURL);
  }).then(function(scriptBlob) {
    console.log("Got worker script");
    scripts.push(scriptBlob);
  }).then(function() {
    var blob = new Blob(scripts);

    // Obtain a blob URL reference to our worker 'file'.
    var blobURL = window.URL.createObjectURL(blob);

    // Create the worker
    var worker = new Worker(blobURL);
    worker.scriptURL = scriptURL;
    worker.state = "installing";
    console.log("Worker created");

// can we return the worker here?
    defer.resolve(registration);
// doing something
    worker.onmessage = function(e) { console.log("E: " , e); };
    setTimeout(function() {
      console.log("Sending install event to worker");
      worker.postMessage(["Event", "install"]);
// not correct
    registration.installed = worker;
      console.log("Sending stateChange event to worker");
      worker.postMessage(["Event", "stateChange"]);
    },0);
  }).catch(function(err) {
    console.log("Failure reached");
    defer.reject(err);
  });

  console.log("Returning promise");
// better: do it all with defer, rather than nesting promises this way
  return defer.promise;

};

module.exports = ServiceWorkerRegistration;
