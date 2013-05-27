XHR = function(){
};

// Public functions
// ================

// Retrieves @url (string) 
//
// The result is cached to disk. Next time that url is requested, if a HEAD request
// identifies a Last-Modified header that hasn't changed, the cache will be used
//
// Inspired by: http://developer.appcelerator.com/question/150199/getresponseheader-not-working-in-onreadystatechange-function
XHR.prototype.getIfModified = function(url, onSuccess, onError, extraParams, requestType) {
  function doGetIfModified(url, onSuccess, onError, extraParams, requestType) {
    var HASHED_URI              = "cache_" + Titanium.Utils.md5HexDigest(url);
    var HTTP_OK                 = 200;
    var HTTP_NOT_MODIFIED       = 304;
    var xhr                     = Titanium.Network.createHTTPClient();
    var onSuccess               = onSuccess               || function(){};
    var onError                 = onError                 || function(){};
    var extraParams             = extraParams             || {};
    var requestType             = requestType             || "HEAD";  // First time around, only do a HEAD request to see if the resource has changed
    extraParams.async           = extraParams.async       || true;
    extraParams.contentType     = extraParams.contentType || "application/json";
    extraParams.ifModifiedSince = Titanium.App.Properties.getString(HASHED_URI);
  
    function handleResponse(e){
      var not_modified = (this.status == HTTP_NOT_MODIFIED);
      if (this.status == HTTP_OK || not_modified) {
        var cachedFile = Ti.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, HASHED_URI);
  
        if (requestType == "HEAD") {
          Ti.API.info("stocklight.log Not Modified / Timestamp: " + not_modified + ", " + extraParams.ifModifiedSince);
          Ti.API.info("stocklight.log Cache exists: " + cachedFile.exists());
          if (not_modified && cachedFile.exists()) {
            // return the current cached copy of the resource
            Ti.API.info("stocklight.log retrieved from cache: " + url);
            Ti.API.info("stocklight.log cached file: " + cachedFile.getNativePath());
            var data = cachedFile.read();
            if(extraParams.contentType.indexOf("json") != -1) {
              data = JSON.parse(data);
            }
            onSuccess(data);
          } else {
            // otherwise, go and get it
            Ti.App.Properties.removeProperty(HASHED_URI);
            doGetIfModified(url, onSuccess, onError, extraParams, 'GET');
          }
        } else if (requestType == "GET") {
          // store and return the retrieved response
          Ti.API.info("stocklight.log retrieved: " + url);
          var data = this.responseText
          if(cachedFile.write(data)){
            // https://jira.appcelerator.org/browse/TIMOB-1658
            var lastModified = this.getResponseHeader("Last-Modified");
            Ti.App.Properties.setString(HASHED_URI, lastModified);
            Ti.API.info('stocklight.log Written: ' + cachedFile.getNativePath() + ", with Last-Modified: " + lastModified );
          } else {
            Ti.API.info('stocklight.log failed to write: ' + cachedFile.getNativePath() );
          }
          if(extraParams.contentType.indexOf("json") != -1) {
            data = JSON.parse(data);
          }
          onSuccess(data);
        }
      } else {
        var result = {};
        result.status = "error";
        result.data = e;
        result.code = xhr.status;
        onError(result);
      }
    }
  
    xhr.onload = handleResponse;
    xhr.onerror = handleResponse;

    // Set any required headers and send the HTTP request
    Ti.API.info('stocklight.log sending ' + requestType + ' request to: ' + url );
    xhr.open(requestType, url, extraParams.async);
    xhr.setRequestHeader('If-Modified-Since', extraParams.ifModifiedSince);
    xhr.setRequestHeader('Content-Type', extraParams.contentType);
    if(extraParams.headers) {
      for(i in extraParams.headers) {
        var header = extraParams.headers[i];
        xhr.setRequestHeader(header.name, header.value);
      }
    }
    xhr.send();
  }
  
  // Schedule a HEAD request
  doGetIfModified(url, onSuccess, onError, extraParams, requestType);
}

// Return everything
module.exports = XHR;