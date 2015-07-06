'use strict';

//var TypeEnv = require('./type_environment');
//var Util = require('./type_utilities');
//var DomUtil = require('./dom_utilities');
//var TypeContents = require('./type_contents');
//var Formatting = require('./formatting');
//var Caret = require('./caret');
//var TypeSelection = require('./type_selection');
//var TypeInput = require('./type_input');

/**
 * Creates a new Type editor and sets up the core
 * modules used for WYSIWYG editing. The core
 * class only holds methods for setting and retrieving
 * options as well getters and setters for instances
 * of core modules.
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
  if (Type.DomUtilities.isNode(options)) {
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
  //this._contents = new TypeContents();
  //this._formatting = new Formatting(this);
  //this._caret = new Caret(this._root);
  //this._selection = new TypeSelection(this);
  //this._input = new TypeInput(this);

  console.log(Type.Environment);
  console.log(Type.Utilities);
  console.log(Type.DomUtilities);
  console.log(Type.DomWalker);
  console.log(Type.TextWalker);
  console.log(Type.Range);
  console.log(Type.Contents);
  console.log(Type.Formatting);
  console.log(Type.Caret);

  this._caret = new Type.Caret(this._root);

  // Trigger events
  //Type.trigger('ready', this);

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

    this.options = this.options || Type.Utilities.extend({}, this._defaultOptions);

    if (typeof options === "string" && arguments.length === 1) {
      return this.options[options];
    }

    if (typeof options === "string" && arguments.length === 2) {
      options = {options: value};
    }

    if (typeof options === "object") {
      Type.Utilities.extend(this.options, options);
    }

    if (options.el) {
      this._root = options.el;
    }

    return this;

  };

  /**
   * Creates a {DomWalker} that ist constrained to this
   * instance's root element unless you explicitly pass
   * a constrainingNode as argument. All other DomWalker
   * options can also be passed to this.
   */
  this.createDomWalker = function () {
    // todo implement me
  };

  /**
   * Getter for this instance's root element, i.e. the
   * element that contains this editor's text.
   * @returns {Element}
   */
  this.getRoot = function () {
    return this._root;
  };

  /**
   * Getter for this instance's caret.
   * @returns {Caret}
   */
  this.getCaret = function () {
    return this._caret;
  };

  /**
   * Getter for this instance's selection.
   * @returns {TypeSelection}
   */
  this.getSelection = function () {
    return this._selection;
  };

  /**
   * Getter for this instance's text.
   * @returns {TypeContents}
   */
  this.getContents = function () {
    return this._contents;
  };

  /**
   * Getter for this instance's formatting class instance.
   * @returns {Formatting}
   */
  this.getFormatting = function () {
    return this._formatting;
  };

  /**
   * Getter for this instance's input.
   * @returns {TypeInput}
   */
  this.getInput = function () {
    return this._input;
  };

}).call(Type.prototype);

/**
 * Exposes Type's prototype as jQuery-style shorthand variable
 * @type {Object}
 */
Type.fn = Type.prototype;

/**
 *
 * @type {{}}
 */
Type.Events = {};

/**
 * Module Exports for CommonJs
 * @type {Type}
 */
module.exports = Type;
