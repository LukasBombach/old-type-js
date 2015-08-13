'use strict';

/**
 * Creates a new Type.Etherpad instance
 *
 * @param {Object} [options] - Settings for connecting to an
 *     Etherpad server
 * @constructor
 */
Type.Etherpad = function (options) {
  this.options(options || {});
  this._revision = -1;
  this._client = new Type.Etherpad.Client(this);
};

(function () {

  /**
   * Object that holds the default settings for communicating with an
   * Etherpad server.
   *
   * @type {{host: string, port: number, rootPath: string, apikey: null}}
   */
  this._defaultOptions = {
    host     : 'localhost',
    port     : 9001,
    rootPath : '/api/1.2.1/'
  };

  /**
   * Sets the options to be used for communicating with an
   * Etherpad server. Takes either a plain object or a key
   * value combination to set a single, specific option.
   * In the latter case, the key must be a {string}.
   *
   * @param {(string|Object)} options - Either a plain object
   *     with keys and values to be set or a string that will
   *     be used as a name for a option. If you pass a string,
   *     pass a second parameter to set that option or no
   *     second parameter to retrieve that option.
   * @param {*} [value] - If the first parameter is a string,
   *     this value will be set to the key of the given first
   *     parameter. Any arbitrary value can be set.
   * @returns {Type|*} Returns the type instance if you set an
   *     option or the according value if you get an option
   */
  this.options = function (options, value) {

    // Load default options if there are no instance options yet
    this._options = this._options || Type.Utilities.extend({}, this._defaultOptions);

    // Pass a single option name to fetch it
    if (typeof options === "string" && arguments.length === 1) {
      return this._options[options];
    }

    // Pass an option name and a value to set it
    if (typeof options === "string" && arguments.length === 2) {
      options = {options: value};
    }

    // Pass an object of key-values to set them
    if (typeof options === "object") {
      Type.Utilities.extend(this._options, options);
    }

    // Chaining / Returning data
    return arguments.length ? this : this._options;

  };

}).call(Type.Etherpad.prototype);

/**
 *
 * @param options
 * @constructor
 */
Type.fromEtherpad = function(options) {



};

module.exports = Type.Etherpad;

