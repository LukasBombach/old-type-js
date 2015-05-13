'use strict';

/**
 * Loads a document from an Etherpad Pad
 * @type {EtherpadReader}
 */
var EtherpadReader = require('./plugins/Etherpad/reader');
var EtherpadInput = require('./plugins/Etherpad/input');

var TypeDocument = require('./type_document');
var DocumentNode = require('./document_node');


/**
 * Renders a {TypeDocument} to HTML
 * @type {HtmlRenderer}
 */
var Renderer = require('./renderers/html');

/**
 * The main class and entry point to set up a Type instance in the browser.
 *
 * @class Type
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

}

(function () {

  /**
   * This object holds the settings for this Type instance
   * Todo All Instances will share the same options
   *
   * @type {{reader: null, renderer: null}}
   */
  this.options = {
    reader   : null,
    renderer : null
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
   * Etherpad Dev code
   * @returns {EtherpadInput}
   */
  this.etherpad = function(renderTo) {

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
        renderTo.appendChild(renderer.output());
        input.caret.moveTo(renderTo.childNodes[0].childNodes[0], 0)._blink();
      }
    });

  }

}).call(Type.prototype);

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
