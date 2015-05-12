'use strict';

var Caret = require('./Caret');

/**
 * Class to call methods on an EtherpadLite server
 *
 * @class EtherpadLite
 * @param {Object} [options] - Settings to connect to an Etherpad
 *     server with
 * @constructor
 */
function EtherpadLite(options) {
  this.setOptions(options);
}

(function () {

  /**
   * Object that holds the settings for communicating with an
   * Etherpad server. Initial values are the default options.
   *
   * @type {{host: string, port: number}}
   */
  this.options = {
    host     : 'localhost',
    port     : 9001,
    rootPath : '/api/1.2.1/',
    apikey   : '6535d0f30f0ce73a5a183dd1ee1909b5a233ed5d024bc0bc09bf35ee78ca0671'//null
  };

  /**
   * Sets the options to be used for communicating with an
   * Etherpad server. Takes either a plain object or a key
   * value combination to set a single, specific option.
   * In the latter case, the key must be a {string}.
   *
   * @param {(string|Object)} options - Either a plain object
   *     with keys and values to be set or a string that will
   *     be used as a key to set a single specific value
   * @param {*} [value] - If the first parameter is a string,
   *     this value will be set to the key of the give first
   *     parameter. Any arbitrary value can be set.
   * @returns {EtherpadLite}
   */
  this.setOptions = function(options, value) {
    var prop;
    if (typeof options === "string") {
      this.options[options] = value;
    } else {
      for (prop in options) {
        this.options[prop] = options[prop];
      }
    }
    return this;
  };

  /**
   * Calls a method on the Etherpad server
   *
   * @param {string} method - The method to be called on the server
   * @param {Object} params - The parameters sent to the method
   * @param {function} callback - The callback to be called on
   *     completion of the request. This function will receive 2
   *     parameters. The first one will be the code as returned by
   *     etherpad lite. If the request itself was erroneous this
   *     code will be -2. The second argument will be an object
   *     created from the JSON as returned by the server. If the
   *     request was erroneous, the raw server output will be passed
   *     instead of an object.
   * @returns {EtherpadLite}
   */
  this.call = function(method, params, callback) {
    if(typeof params === "function") {
      callback = params;
      params = null;
    }
    var paramsQuery = params ? '&' + this._queryString(params || {}) : '';
    var url = this._getApiUrl() + method + '?' + this._getApiParams() + paramsQuery;
    this._getEtherpadJSON(url, callback);
    return this;
  };

  /**
   * Performs a XMLHttpRequest request and calls the callback
   * on completion.
   *
   * Todo There should be a utility module for XMLHttpRequest requests
   *
   * @param {string} url - The URL that will be called
   * @param {function} [callback] - The function that shall be
   *     called on completion. First parameter passed to the
   *     function will be a {boolean} which will be true if
   *     the request was successful. The second parameter will
   *     be the data returned by the request. If the call was
   *     successful, the data will have been parsed as JSON,
   *     otherwise the raw response text will be returned.
   * @returns {EtherpadLite}
   * @private
   */
  this._getEtherpadJSON = function(url, callback) {

    // Create the request
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    // When the request completes...
    request.onreadystatechange = function() {
      if (this.readyState === 4) {

        // ... check if it was successful and transform the response text
        var success = this.status >= 200 && this.status < 400,
          response = success ? JSON.parse(this.responseText) : this.responseText,
          successCode = success ? response.code : -2;

        // Call the callback - if provided
        if(callback) {
          callback(successCode, response)
        }
      }
    };

    // Send the request and return this for chaining
    request.send();
    return this;
  };

  /**
   * Returns a full URL to an Etherpad server including protocol,
   * host, port and root path
   *
   * @returns {string}
   * @private
   */
  this._getApiUrl = function() {
    var protocol = this.options.port == 443 ? 'https' : 'http',
      rootPath = this.options.rootPath || '/';
    return protocol + '://' + this.options.host + ':' + this.options.port + rootPath
  };

  /**
   * Takes a subset (the options required for every API call) of
   * this.options and returns them as URL-encoded parameters
   *
   * @returns {string}
   * @private
   */
  this._getApiParams = function() {
    var apiOptions = {
      apikey : this.options.apikey
    };
    return this._queryString(apiOptions);
  };

  /**
   * Encodes an object as query string
   *
   * @param {Object} params - The keys and values that will be encoded
   * @returns {string} - A query string based on the keys and values
   *     of the given params
   * @private
   */
  this._queryString = function(params) {
    var urlParams = [], k;
    for(k in params) {
      urlParams.push( k + '=' + encodeURIComponent(params[k]) )
    }
    return urlParams.join('&');
  }

}).call(EtherpadLite.prototype);

module.exports = EtherpadLite;

