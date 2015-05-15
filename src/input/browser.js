'use strict';

var Caret = require('./Caret');
var DomReader = require('../readers/dom');

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
}

(function () {

  /**
   * Will pass a {TypeDocument} to the callback as read
   * from a DOM tree
   *
   * @param callback
   */
  this.getDocument = function(callback) {
    var doc = this._reader.getDocument();
    callback(doc);
  };

  /**
   * Finds the first visible text node in an element. Will
   * return the elemmt itself, if it is already a text node
   *
   * @param el
   * @returns {*}
   * @private
   */
  this._findFirstTextNode = function(el) {
    el = el || this._rootNode;
    var i, c;
    if(this._isTextNodeWithContents(el)) {
      return el;
    }
    if(el.childNodes.length == 0) {
      return null;
    }
    for(i = 0; i < el.childNodes.length; i++) {
      if(c = this._findFirstTextNode(el.childNodes[i])) {
        return c;
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

}).call(BrowserInput.prototype);

module.exports = BrowserInput;
