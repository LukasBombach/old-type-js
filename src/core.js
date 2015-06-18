'use strict';

/**
 * Loads a document from an Etherpad Pad
 * @type {EtherpadReader}
 */
var EtherpadReader = require('./plugins/Etherpad/reader');
var EtherpadInput = require('./plugins/Etherpad/input');
var TypeDocument = require('./type_document');
var DocumentNode = require('./document_node');
var BrowserInput = require('./input/browser');
var Cmd = require('./cmd');

/**
 * Renders a {TypeDocument} to HTML
 * @type {HtmlRenderer}
 */
var Renderer = require('./renderers/html');

/**
 * The main class and entry point to set up a Type instance in the browser.
 *
 * @class Type
 * @param options
 * @constructor
 */
function Type(options) {

  // var DomReader = require('./readers/dom');
  // var reader = new DomReader(element);
  // var document = reader.getDocument();
  // var renderer = new Renderer(document);
  // var output = renderer.output();
  // elementOut.appendChild(output);

  options = options || {};
  this.setOptions(options);
  this._input = new this.options.input(this.options.root);
  this._input.getDocument(this._setDocument.bind(this));

  // Todo Jira TYPE-22
  this.cmd = new Cmd(this.options.root);

  this.eventCallbacks = {};

}

(function () {

  /**
   * Register a callback for a Type specific event
   *
   * @param {String} eventName - The name of the event on which you wish the
   *     function to be called
   * @param {Function} cb - The function you wish to be called on the event
   * @returns {Type}
   */
  this.on = function (eventName, cb) {
    this.eventCallbacks[eventName] = this.eventCallbacks[eventName] || [];
    this.eventCallbacks[eventName].push(cb);
    return this;
  };

  /**
   * Unregister a callback for a Type specific event
   *
   * @param {String} eventName - The name of the event on which you wish the
   *     for which you no longer wish to call the function
   * @param {Function} cb - The function you no longer wish to be called
   * @returns {Type}
   */
  this.off = function (eventName, cb) {
    var index = this.eventCallbacks[eventName] ? this.eventCallbacks[eventName].indexOf(cb) : -1;
    if (index > -1) {
      this.eventCallbacks[eventName].splice(index, 1);
    }
    return this;
  };

  /**
   * Trigger a Type specific event to call all callbacks for
   *
   * @param {String} eventName - The name of the event on which you wish to
   *     call its callbacks for
   * @param {...*} params - Arbitrary parameters you wish to pass to the
   *     callbacks
   * @returns {Type}
   */
  this.trigger = function (eventName, params) {
    var i;
    if (this.eventCallbacks[eventName]) {
      for (i = 0; i < this.eventCallbacks[eventName].length; i += 1) {
        this.eventCallbacks[eventName][i].apply(this, params);
      }
    }
    return this;
  };

  /**
   * This object holds the settings for this Type instance
   * Todo All Instances will share the same options, make this "defaultOptions"
   *
   * @type {{reader: null, renderer: null}}
   */
  this.options = {
    input : BrowserInput,
    root  : null
  };

  /**
   * Sets the options to be used by this Type instance. Takes
   * either a plain object or a key value combination to set
   * a single, specific option. In the latter case, the key
   * must be a {string}.
   *
   * @param {(string|Object)} options - Either a plain object
   *     with keys and values to be set or a string that will
   *     be used as a key to set a single specific value
   * @param {*} [value] - If the first parameter is a string,
   *     this value will be set to the key of the give first
   *     parameter. Any arbitrary value can be set.
   * @returns {Type}
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
   * Setter for the internal document representation
   *
   * @param doc
   * @returns {Type}
   * @private
   */
  this._setDocument = function(doc) {
    this._document = doc;
    return this;
  };

  /**
   * Etherpad Dev code
   *
   * @returns {EtherpadInput}
   */
  this.etherpad = function(options) {

    //var reader = new EtherpadReader();
    //reader.getDocument(function(document) {
    //  console.log(document);
    //  var renderer = new Renderer(document);
    //  renderTo.appendChild(renderer.output());
    //});

    return new EtherpadInput({
      onContentLoaded : function(text, input) {
        var node = new DocumentNode('P');
        node.childNodes.push(new DocumentNode('TEXT', text));
        var document = new TypeDocument(node);
        var renderer = new Renderer(document);
        options.renderTo.appendChild(renderer.output());
        input.caret.moveTo(options.renderTo.childNodes[0].childNodes[0], 0)._blink();
        options.onload(input);
      }
    });

  }

}).call(Type.prototype);

/**
 *
 * @param options
 * @constructor
 */
Type.fromEtherpad = function(options) {
  var etherpadInput = new EtherpadInput({
    onContentLoaded : function(text, input) {

      //var node = new DocumentNode('P');
      //node.childNodes.push(new DocumentNode('TEXT', text));
      //var document = new TypeDocument(node);
      //var renderer = new Renderer(document);
      //options.renderTo.appendChild(renderer.output());
      //input.caret.moveTo(options.renderTo.childNodes[0].childNodes[0], 0)._blink();
      //options.onload(input);

      var p = window.document.createElement('p');

      text = text.replace(/(?:\r\n|\r|\n)/g, '<br />');

      p.innerHTML = text;

      //var textNode = window.document.createTextNode(text);
      //p.appendChild(textNode);
      options.root.appendChild(p);
      input.caret.moveTo(options.root.childNodes[0].childNodes[0], 0)._blink();

      var type = new Type({
        root : options.root
      });

      var typeCaret = type._input._caret;

      typeCaret.registerCallback('_setOffset', function() {
        input.progagateCaret(this.offset, 0);
      });

      // todo numChars
      typeCaret.registerCallback('removeCharacter', function(numChars) {
        input.propagateUpdate(p, '-', typeCaret.offset - 1, 1);
      });

      typeCaret.registerCallback('insertText', function(val) {
        input.propagateUpdate(p, '+', typeCaret.offset, val.length, val);
      });

      return type;

    }
  });
};

/**
 * Exposes Type's prototype as jQuery-style shorthand
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
