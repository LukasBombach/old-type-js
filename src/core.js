'use strict';

var DomUtil = require('./dom_utilities');
var TypeInput = require('./type_input');

/**
 * The main class and entry point to set up a Type instance in the browser.
 *
 * @class Type
 * @param options
 * @constructor
 */
function Type(options) {

  // Allow passing an element as only parameter
  if (DomUtil.isEl(options)) {
    options = { el: options };
  }

  // If no element has been passed, interrupt
  if (!options.el) {
    throw new Error('You must provide an element as root node for the editor\'s contents.');
  }

  // Save settings for this editor
  this.setOptions(options);

  // Set up core editor modules
  this._plugins = {};
  this.input = new TypeInput(this);

  // Trigger events
  Type.trigger('ready', this);

}

(function () {

  /**
   * Holds the default options for every editor. These options
   * will be extended by the options passed to each instance
   * on instantiation.
   *
   * @type {{el: null}}
   * @private
   */
  this._defaultoOptions = {
    el : null
  };

  /**
   * Sets or gets the options to be used by this Type instance.
   *
   * Pass a single string to get an option:
   * this.options('el')
   * -> returns your editor's contents baseelement
   *
   * Pass a name value combination to set a specific option
   * this.options('el', myElement)
   * -> sets the base element
   *
   * Pass an object to set multiple options
   * this.options({el: myElement, foo:bar})
   * -> sets both parameters
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

    this._options = this._options || this._extend({}, this._defaultoOptions);

    if (typeof options === "string" && arguments.length === 1) {
      return this._options[options];
    }

    if (typeof options === "string" && arguments.length === 2) {
      options = {options: value};
    }

    if (typeof options === "object") {
      this._extend(this._options, options);
    }

    if (options.el) {
      this.root = options.el;
    }

    return this;

  };

  /**
   * Get or set a plugin
   *
   * @param {string} name - The name of the plugin that should
   *     be gotten and set
   * @param {*} [value] - The value to be set for the plugin
   * @returns {*}
   */
  this.plugin = function (name, value) {
    if (value !== null) this._plugins[name] = value;
    return this._plugins[name];
  };

  /**
   * Get or set a plugin
   *
   * @param {string} name - The name of the plugin that should
   *     be gotten and set
   * @param {*} [value] - The value to be set for the plugin.
   *     If you pass an instance of a function, this instance
   *     will be set. If you pass an uninstantiated function,
   *     it will be instantiated.
   * @param {...*} [params] - Arguments passed to the instance
   *     that will be created for value
   * @returns {*}
   */
  this.pluginInstance = function (name, value, params) {

    params = Array.prototype.slice.call(arguments, 2);

    if (this._plugins[name])
      return this._plugins[name];

    if (value instanceof Function) {
      this._plugins[name] = new (Function.prototype.bind.apply(value, params));
    } else {
      this._plugins[name] = value;
    }

    return this._plugins[name];
  };

  /**
   * Call a method from an object (usually a plugin). If the called
   * method returns the plugin, return this type instance instead.
   * If the given method name is not a method in the object, call the
   * given callback.
   *
   * callMethodFrom purpose is to provide a shorthand way to expose
   * the API of a plugin as API of Type
   *
   * @param module
   * @param method
   * @param params
   * @param fallback
   * @returns {Type|*}
   */
  this.callMethodFrom = function (module, method, params, fallback) {

    var result = null;

    if (method in module) {
      result = module[method].apply(module, params);
    } else if (fallback) {
      result = fallback.apply(module, [method].concat(params));
    } else {
      throw new Error('Method ' + method + 'cannot be found in given module');
    }

    return result === module ? this : result;

  };

  /**
   * This behaves similar to jQuery's extend method. Writes all properties
   * from the objects passed as copyFrom to the object passed  as copyTo.
   * Copying starts from left to right and will overwrite each setting
   * subsequently.
   *
   * @param {*} copyTo
   * @param {...{}} copyFrom
   * @returns {*}
   * @private
   */
  this._extend = function(copyTo, copyFrom) {
    for(var i=1; i<arguments.length; i++)
      for(var key in arguments[i])
        if(arguments[i].hasOwnProperty(key))
          arguments[0][key] = arguments[i][key];
    return arguments[0];
  }

}).call(Type.prototype);

/**
 * Exposes Type's prototype as jQuery-style shorthand variable
 *
 * @type {Object}
 */
Type.fn = Type.prototype;

/**
 * Module Exports for CommonJs
 *
 * @type {Type}
 */
module.exports = Type;
