'use strict';

var Type = require('../../core');

/**
 * Creates a new Type.Etherpad instance
 *
 * @param {Type} type - A Type instance Etherpad should
 *     use for collaboration
 * @constructor
 */
Type.Etherpad = function (type) {

  this.options(type.options('etherpad') || {});

  this._type = type;
  this._caret = type.getCaret();

  this._client = new Type.Etherpad.Client(this);
  this._client.onInit(this._initEditor.bind(this));
  this._client.connect();

  this._content = new Type.Etherpad.Content(this);

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

  /**
   * Getter for the Type instance
   * @returns {Type}
   */
  this.getType = function () {
    return this._type;
  };

  /**
   * Getter for the Etherpad client
   * @returns {Type.Etherpad.Client}
   */
  this.getClient = function () {
    return this._client;
  };

  /**
   * Getter for the Etherpad content
   * @returns {Type.Etherpad.Content}
   */
  this.getContent = function () {
    return this._content;
  };

  /**
   * Will load the pad contents from an Etherpad connection message
   * to the Type editor contents.
   *
   * @param {{attribs: string, text: string}} contents - The contents
   *     of the editor sent by the server
   * @returns {Type.Etherpad} - This instance
   * @private
   */
  this._initEditor = function (contents, apool) {
    var changeset = this._initChangeset(contents);
    Type.Development.log(changeset);
    this._type.getRoot().innerHTML = Type.Etherpad.Util.nl2br(contents.text);
    this._content.applyChangeset(changeset, apool);
    this._startSending();
    return this;
  };

  /**
   * Listens to Type Events and sends changesets to the connected Etherpad
   * Server.
   *
   * @returns {Type.Etherpad} - This instance
   * @private
   */
  this._startSending = function () {
    this._type.on('input', function (e) {

      var char, insertion, deletion, offset;

      char = String.fromCharCode(e.keyCode);
      char = e.shift ? char : char.toLowerCase();
      Type.Development.log(char, e.keyCode);

      if (e.keyCode == 8 || e.keyCode == 46) {
        offset = this._caret.getOffset();
        deletion = new Type.Etherpad.Changeset.Changes.Removal(offset, 1);
        this._client.send(deletion);
      } else if(/[a-zA-Z]/.test(char)) {
        offset = this._caret.getOffset();
        insertion = new Type.Etherpad.Changeset.Changes.Insertion(offset, char);
        this._client.send(insertion);
      }

    }.bind(this));
    return this;
  };

  /**
   * Creates a regular changeset from the initial attributes of an Etherpad
   * server.
   *
   * @param {{attribs: string, text: string}} contents - The contents
   *     of the editor sent by the server
   * @returns {string} - A regularly formatted changeset
   * @private
   */
  this._initChangeset = function (contents) {
    var prefix = 'Z:' + contents.text.length.toString(36) + '>0',
      body = contents.attribs.replace(/\+/g, '='),
      appendix = '$';
      return prefix + body + appendix;
  };

}).call(Type.Etherpad.prototype);

/**
 * Creates a new Type instance connected to an Etherpad server
 *
 * @param {{}|Element} options - The options you would pass to instantiate a
 *     Type instance
 * @param {{}} options.etherpad - The options for the Type.Etherpad
 *     constructor
 * @param {{}|string} [etherpadOpts] - Either the parameters for the
 *     Type.Etherpad constructor or a pad name as a string
 * @param {string} [server] - The URL for the Etherpad server
 * @constructor
 */
Type.fromEtherpad = function(options, etherpadOpts, server) {
  options = Type.Etherpad.prepareOptions(options, etherpadOpts, server);
  var type = new Type(options);
  new Type.Etherpad(type);
  return type;
};

/**
 * Used for the Type.fromEtherpad constructor to process its parameters
 *
 * @param {{}} options - The options you would pass to instantiate a
 *     Type instance
 * @param {{}} options.etherpad - The options for the Type.Etherpad
 *     constructor
 * @param {{}|string} [etherpadOpts] - Either the parameters for the
 *     Type.Etherpad constructor or a pad name as a string
 * @param {string} [server] - The URL for the Etherpad server
 * @returns {{}}
 */
Type.Etherpad.prepareOptions = function (options, etherpadOpts, server) {

  options = options || {};
  etherpadOpts = etherpadOpts || {};

  if (Type.DomUtilities.isNode(options)) {
    options = { el: options };
  }

  if (arguments.length === 3) {
    etherpadOpts = { pad:etherpadOpts, server:server };
  }

  if (typeof etherpadOpts === 'string') {
    etherpadOpts = { pad:etherpadOpts };
  }

  options.etherpad = etherpadOpts;
  return options;

};

module.exports = Type.Etherpad;

