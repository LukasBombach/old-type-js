'use strict';

/**
 * Loads a document from an Etherpad Pad
 * @type {EtherpadReader}
 */
//var EtherpadReader = require('./plugins/Etherpad/reader');
//var EtherpadInput = require('./plugins/Etherpad/input');
//var TypeDocument = require('./type_document');
//var DocumentNode = require('./document_node');
var BrowserInput = require('./input/browser');
//var Cmd = require('./cmd');
//var Renderer = require('./renderers/html');

var TypeInput = require('./type_input');


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
  //this._input.getDocument(this._setDocument.bind(this));

  this._plugins = {};
  this.root = options.root;
  this.setOptions(options || {});

  //this._input = new this.options.input(this);
  this.input = new TypeInput(this);

  Type.trigger('ready', this);

}

(function () {

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
  /*
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
 */

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
