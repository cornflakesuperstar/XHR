# What is it?:
XHR is a wrapper around Titanium's HTTPClient. It works perfectly with REST API endpoints and has a built in cache system that you can use for your requests.

# Usage:
In your app.js (or elsewhere), call:

    var XHR = require("/lib/xhr");
    var xhr = new XHR();
    xhr.get("http://freegeoip.net/json/", onSuccessCallback, onErrorCallback, options);

For more information check out the [examples.js](https://github.com/raulriera/XHR/blob/master/examples.js) file. Or browse around the [xhr.js](https://github.com/raulriera/XHR/blob/master/xhr.js) file. You can find in there support for GET, POST, PUT and DELETE (called destroy for reserved words problems)

# Last-Modified header caching
This project fork has provided an API for titanium projects to be able to perform HTTP requests and cache the responses locally until the Last-Modified header changes on the server.

With Ruby on Rails, the Last-Modified header for GET requests can be set using stale?:
[ActionController::ConditionalGet.stale?](http://api.rubyonrails.org/classes/ActionController/ConditionalGet.html#method-i-stale-3F)

What this means for the Titanium app is that when we use the following code:

    var XHR = require("/lib/xhr");
    var xhr = new XHR();
    xhr.getIfModified("http://freegeoip.net/json/", onSuccessCallback, onErrorCallback, options);

It first sends a HTTP HEAD request to:

  http://freegeoip.net/json/

and it then sends a HTTP GET request to retrieve the result and cache it locally to disk.

Next time the above code snippet is called, if the Last-Modified header from the response hasn't changed, it will load the content directly from disk.

For big JSON requests that don't change often, this saves a lot of HTTP traffic between the client and the server.

Ideally, this technique wouldn't require both a HEAD request and a GET request.

Unfortunately, the Titanium HTTP client (as of Titanium version 3.0.2), does not correctly set response headers as per:
http://developer.appcelerator.com/question/150199/getresponseheader-not-working-in-onreadystatechange-function

and therefore at this time, both a HEAD and a GET request are neccessary.

# About:
Created by Raul Riera, [@raulriera](http://twitter.com/raulriera)  
Contributions by Daniel Tamas, [@dan_tamas](http://twitter.com/dan_tamas) and Bob Sims, [@2wheelsburning](http://twitter.com/2wheelsburning)