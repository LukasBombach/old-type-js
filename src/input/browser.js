'use strict';

var Caret = require('./Caret');
var DomReader = require('../readers/dom');
var DeviceInput = require('./browser_device_input');

var TEXT_NODE = 3; // todo Node.TEXT oder so, DOM API

/**
 *
 * @class BrowserInput
 * @constructor
 */
function BrowserInput(rootNode) {
  this._caret = new Caret();
  this._rootNode = rootNode;
  this._reader = new DomReader(this._rootNode);
  this._map = this._reader.getMap();
  this._caret.moveTo(this._findFirstTextNode())._blink();
  this._bindKeyboardAndMouse(this._caret);
}

(function () {

  /**
   * Will pass a {TypeDocument} to the callback as read
   * from a DOM tree
   *
   * @param callback
   * @returns {BrowserInput}
   */
  this.getDocument = function(callback) {
    var doc = this._reader.getDocument();
    callback(doc);
    return this;
  };

  /**
   * Finds the first visible text node in an element. Will
   * return the elemmt itself, if it is already a text node
   *
   * @param el
   * @returns {BrowserInput}
   * @private
   */
  this._findFirstTextNode = function(el) {
    el = el || this._rootNode;
    var i, child;
    if(this._isTextNodeWithContents(el)) {
      return el;
    }
    for(i = 0; i < el.childNodes.length; i++) {
      if(child = this._findFirstTextNode(el.childNodes[i])) {
        return child;
      }
    }
    return null;
  };

  /**
   * Returns true if a give node is a text node and its contents is not
   * entirely whitespace.
   *
   * @param node
   * @returns {boolean}
   * @private
   */
  this._isTextNodeWithContents = function(node) {
    return node.nodeType == TEXT_NODE && /[^\t\n\r ]/.test(node.textContent);
  };

  /**
   *
   * @param caret
   * @returns {BrowserInput}
   * @private
   */
  this._bindKeyboardAndMouse = function(caret) {
    new DeviceInput(this._rootNode, caret);
    return this;
  }

}).call(BrowserInput.prototype);

module.exports = BrowserInput;
