'use strict';

var Caret = require('./Caret');
var DomReader = require('../readers/dom');

var TEXT_NODE = 3; // todo Node.TEXT oder so, DOM API
var COMMENT_NODE = 8;

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
  console.log(this._map);
  this._caret._blink();
  var firstTextNode = this._findFirstTextNode();
  this._caret.moveTo(firstTextNode);
}

(function () {

  this.getDocument = function(callback) {
    var doc = this._reader.getDocument();
    callback(doc);
  };

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

  //this._isIgnorable = function(node) {
  //  var isAllWhiteSpace = !(/[^\t\n\r ]/.test(node.textContent));
  //  return node.nodeType == COMMENT_NODE || (node.nodeType == TEXT_NODE && isAllWhiteSpace);
  //};


}).call(BrowserInput.prototype);

module.exports = BrowserInput;
