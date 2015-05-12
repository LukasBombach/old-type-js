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
    apiKey   : null
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
   *
   * @returns {EtherpadLite}
   */
  this.call = function(method, params, callback) {
    params = params || {};
    var url = this._getApiUrl() + method + '?' + this._getApiParams + '&' + this._queryString(params);
    this._getJSON(url, callback);
    return this;
  };

  /**
   * Performs a XMLHttpRequest request and calls the callback
   * on completion.
   *
   * Todo There should be a utility module for XMLHttpRequest requests
   *
   * @param {string} url - The URL that will be called
   * @param {callback} [callback] - The function that shall be
   *     called on completion. First parameter passed to the
   *     function will be a {boolean} which will be true if
   *     the request was successful. The second parameter will
   *     be the data returned by the request. If the call was
   *     successful, the data will have been parsed as JSON,
   *     otherwise the raw response text will be returned.
   * @returns {EtherpadLite}
   * @private
   */
  this._getJSON = function(url, callback) {

    // Create the request
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    // When the request completes...
    request.onreadystatechange = function() {
      if (this.readyState === 4) {

        // ... check if it was successful and transform the response text
        var success = this.status >= 200 && this.status < 400,
          response = success ? JSON.parse(this.responseText) : this.responseText;

        // Call the callback - if provided
        if(callback) {
          callback(success, response)
        }

      }
    };

    // Send the request and clear the variable
    request.send();
    request = null;

    // Chaining
    return this;
  };

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
      host   : this.options.host,
      port   : this.options.port,
      apiKey : this.options.apiKey
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

