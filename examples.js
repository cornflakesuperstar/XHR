var XHR = require("/lib/xhr");
var xhr = new XHR();

// Normal plain old request with a custom HTTP header
var request_headers = [
  { name: 'Accept',      value: 'application/json' },
  { name: 'X-API-TOKEN', value: 'abcd'             }
];
xhr.get("http://freegeoip.net/json/", onSuccessCallback, onErrorCallback, { headers: request_headers });

function onSuccessCallback(e) {
	// Handle your request in here
	// the module will return an object with two properties
	// data (the actual data retuned
	// status ('ok' for normal requests and 'cache' for requests cached
	Titanium.API.info(JSON.parse(e));
};

function onErrorCallback(e) {
	// Handle your errors in here
};