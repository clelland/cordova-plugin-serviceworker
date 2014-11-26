// Polyfill script
// Add a random script; really we need to polyfill eg promises, caches, etc, here.
// also may need to polyfill custom event -- not for message events, but for all else

;EventQueue = {};

Event = function(type) {
  this.type = type;
  return this;
};

Event.prototype.waitUntil = function(promise) {};

originalAddEventListener = addEventListener;
addEventListener = function(eventName, callback) {
  if (eventName == 'message') {
    originalEventListener.apply(self, arguments);
  } else {
    if (!(eventName in EventQueue))
      EventQueue[eventName] = [];
    EventQueue[eventName].push(callback);
  }
};

dispatchEvent = function(event) {
  (EventQueue[event.type] || []).forEach(function(handler) { handler(event); });
};

onmessage = function(e) {
  if (e.data instanceof Array && e.data[0] === 'Event') {
    dispatchEvent(new Event(e.data[1]));
  } else {
    postMessage('msg from worker: ' + typeof(e.data));
  }
};

Cache = function(name) {
  this.name = name;
  return this;
};

Cache.prototype.addAll = function(urls) {
  console.log(urls);
};

CacheStorage = function() {
  this.caches = [];
  return this;
};

CacheStorage.prototype.open = function(name) {
  var d = Q.defer();
  var cache;
  for (var i=0; i < this.caches.length; ++i) {
    if (this.caches[i][0] == name) {
      d.resolve(this.caches[i][1]);
      return d.promise;
    }
  }
  var newCache = new Cache();
  this.caches.push([name, newCache]);
  d.resolve(newCache);
  return d.promise;
};

caches = new CacheStorage();
scriptCache = new Cache();
