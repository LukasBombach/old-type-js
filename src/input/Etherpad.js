'use strict';

var Caret = require('./Caret');

/**
 *
 * Based on etherpad-lite-client-js by Tomas Sedovic
 * {@link https://github.com/tomassedovic/etherpad-lite-client-js}
 * License: MIT (Expat)
 * {@link https://github.com/tomassedovic/etherpad-lite-client-js/blob/master/LICENSE.txt}
 *
 * @param options
 * @constructor
 */
function Etherpad(options) {
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
   * @returns {Etherpad}
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
   * @returns {Etherpad}
   */
  this.connect = function() {
    var rootPath = this.options.rootPath;
    return this;
  };

  /**
   * Takes a subset (the options required for every API call) of
   * this.options and returns them as URL-encoded parameters
   *
   * @returns {string}
   * @private
   */
  this._getApiOptions = function() {
    var param,
      urlParams = [],
      apiOptions = [
        'host', 'port', 'apiKey'
      ];
    for (var i = 0; i < apiOptions.length; i++) {
      param = apiOptions[i];
      urlParams.push( param + '=' + encodeURIComponent(this.options[param]) );
    }
    return urlParams.join('&');
  }

}).call(Etherpad.prototype);

module.exports = Etherpad;

