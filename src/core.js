'use strict';

/**
 * Creates a new Type editor and sets up the core
 * modules used for WYSIWYG editing. The core
 * class only holds methods for setting and retrieving
 * options as well getters and setters for instances
 * of core modules.
 *
 * @param {{}|Element} options - Either pass
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

  // Set up core modules
  this._writer       = new Type.Writer(this);
  this._formatter    = new Type.Formatter(this);
  this._undoManager  = new Type.UndoManager(this);
  //this._content      = new Type.Content(this);
  this._caret        = new Type.Caret(this);
  this._selection    = new Type.Selection(this);
  this._input        = new Type.Input(this);

  // Trigger events
  Type.trigger('ready', this);

}

(function () {

  /**
   * Allows fast detection if an object is a Type Editor
   * instance (or class)
   *
   * @type {boolean}
   */
  this.typeEditor = true;

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
   * Parameters can be passed as you know it from jQuery:
   *
   * Pass a single string to get an option:
   * this.options('el')
   * returns your editor's TypeContents baseelement
   *
   * Pass a name value combination to set a specific option
   * this.options('el', myElement)
   * sets the base element
   *
   * Pass an object to set multiple options
   * this.options({el: myElement, foo:bar})
   * sets both parameters
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

    // If the el option has been passed copy it for quick access
    if (options.el) {
      this._root = options.el;
    }

    // Chaining
    return arguments.length ? this : this._options;
    //return this;

  };

  /**
   * Creates a {Type.DomWalker} that ist constrained to this
   * instance's root element unless you explicitly pass a
   * constrainingNode as argument. All other DomWalker options
   * can also be passed to this as usual.
   *
   * @param {Node} node - Any DOM {Node} to be set as starting
   *     node for the DomWalker
   * @param {Node|string|Function|{constrainingNode: Node, filter: string|Function}} [options]
   *     See {Type.DomWalker} for a description of possible arguments
   * @returns {Type.DomWalker}
   */
  this.createDomWalker = function (node, options) {
    options = Type.DomWalker.loadOptions(options || {});
    options.constrainingNode = options.constrainingNode || this._root;
    return new Type.DomWalker(node, options);
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
   * @returns {Type.Caret}
   */
  this.getCaret = function () {
    return this._caret;
  };

  /**
   * Getter for this instance's selection.
   * @returns {Type.Selection}
   */
  this.getSelection = function () {
    return this._selection;
  };

  /**
   * Getter for this instance's content.
   * @returns {Type.UndoManager}
   */
  this.getUndoManager = function () {
    return this._undoManager;
  };

  /**
   * Getter for this instance's content.
   * @returns {Type.Content}
   */
  //this.getContent = function () {
  //  return this._content;
  //};

  /**
   * Getter for this instance's writer.
   * @returns {Type.Writer}
   */
  this.getWriter = function () {
    return this._writer;
  };

  /**
   * Getter for this instance's formatter.
   * @returns {Formatter}
   */
  this.getFormatter = function () {
    return this._formatter;
  };

  /**
   * Getter for this instance's input.
   * @returns {Type.Input}
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
 * The namespace for Type events
 * @type {{}}
 */
Type.Events = {};

/**
 * The namespace for Type actions
 * @type {{}}
 */
Type.Actions = {};

/**
 * Module Exports for CommonJs
 * @type {Type}
 */
module.exports = Type;
