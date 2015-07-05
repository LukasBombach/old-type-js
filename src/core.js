'use strict';

var TypeEnv = require('./type_environment');
var Util = require('./type_utilities');
var DomUtil = require('./dom_utilities');
var TypeContents = require('./type_contents');
var Formatting = require('./formatting');
var Caret = require('./caret');
var TypeSelection = require('./type_selection');
var TypeInput = require('./type_input');

/**
 * Creates a new Type editor and sets up the core
 * modules used for WYSIWYG editing. The core
 * class holds methods for setting and retrieving
 * options as well as an environment to allow
 * working with plugins.
 *
 * @param {Object|Element} options - Either pass
 *     an associative array with options for this
 *     editor or the root element that should be
 *     used to modify its contents for WYSIWYG
 *     editing
 * @param {Element} options.el The root element
 *     that should be used to modify its contents
 *     for WYSIWYG editing
 * @constructor
 */
function Type(options) {

  // Allow passing an element as only parameter
  if (DomUtil.isNode(options)) {
    options = { el: options };
  }

  // If no element has been passed, interrupt
  if (!options.el) {
    throw new Error('You must provide an element as root node for the editor\'s TypeContents.');
  }

  // Set settings for this editor
  this._root = null;
  this.options(options);

  // Set up core editor modules
  this._plugins = {};
  this._contents = new TypeContents();
  this._formatting = new Formatting(this);
  this._caret = new Caret(this._root);
  this._selection = new TypeSelection(this);
  this._input = new TypeInput(this);

  // Trigger events
  Type.trigger('ready', this);

}

(function () {

  /**
   * Holds the default options for every editor. These options
   * will be extended by the options passed to each instance
   * on instantiation.
   *
   * @type {{el: null, undoSteps: number}}
   * @private
   */
  this._defaultOptions = {
    el        : null,
    undoSteps : 20
  };

  /**
   * Sets or gets the options to be used by this Type instance.
   *
   * Pass a single string to get an option:
   * this.options('el')
   * -> returns your editor's TypeContents baseelement
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

    this.options = this.options || Util.extend({}, this._defaultOptions);

    if (typeof options === "string" && arguments.length === 1) {
      return this.options[options];
    }

    if (typeof options === "string" && arguments.length === 2) {
      options = {options: value};
    }

    if (typeof options === "object") {
      Util.extend(this.options, options);
    }

    if (options.el) {
      this._root = options.el;
    }

    return this;

  };

  /**
   * Get or set a plugin. Will return the plugin with the given
   * name. Pass a second parameter to set the plugin to the
   * given name.
   *
   * @param {string} name - The name of the plugin that should
   *     be gotten or set
   * @param {*} [value] - The value to be set for the plugin
   * @returns {*}
   */
  this.plugin = function (name, value) {
    if (value !== null) {
      this._plugins[name] = value;
    }
    return this._plugins[name];
  };

  /**
   * Get or set a plugin. There are 2 essential differences to
   * this.plugin.
   *
   * 1) If the plugin given as name already exists, it will not
   * be set, even if you pass subsequent parameters.
   *
   * 2) If the value passed is a Function object (not an instance)
   * it will be instantiated with the given params and saved
   * under the given name. If value is an instantiated object it
   * will simply be written to name, just as this.plugin would.
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

    if (this._plugins[name]) {
      return this._plugins[name];
    }

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

    if (module.hasOwnProperty(method)) {
      result = module[method].apply(module, params);

    } else if (fallback) {
      result = fallback.apply(module, [method].concat(params));

    } else {
      throw new Error('Method ' + method + 'cannot be found in given module');
    }

    return result === module ? this : result;

  };

  /**
   * Getter for this instance's root element
   *
   * @returns {Element}
   */
  this.getRoot = function () {
    return this._root;
  };

  /**
   * Getter for this instance's caret
   *
   * @returns {Caret}
   */
  this.getCaret = function () {
    return this._caret;
  };

  /**
   * Getter for this instance's selection
   *
   * @returns {TypeSelection}
   */
  this.getSelection = function () {
    return this._selection;
  };

  /**
   * Getter for this instance's text
   *
   * @returns {TypeContents}
   */
  this.getContents = function () {
    return this._contents;
  };

  /**
   * Getter for this instance's text
   *
   * @returns {Formatting}
   */
  this.getFormatting = function () {
    return this._formatting;
  };

  /**
   * Getter for this instance's input
   *
   * @returns {TypeInput}
   */
  this.getInput = function () {
    return this._input;
  };

}).call(Type.prototype);

/**
 * Exposes Type's prototype as jQuery-style shorthand variable
 *
 * @type {Object}
 */
Type.fn = Type.prototype;

/**
 * Holds information on the current browser and os
 *
 * @type {TypeEnvironment}
 */
Type.env = TypeEnv;

/**
 * Module Exports for CommonJs
 *
 * @type {Type}
 */
module.exports = Type;
