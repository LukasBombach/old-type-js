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
      host : 'localhost',
      port : 9001
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
  };

}).call(Etherpad.prototype);

module.exports = Etherpad;

