'use strict';

var Caret = require('./Caret');

var TEXT_NODE = 3;

/**
 *
 * @class BrowserInput
 * @constructor
 */
function BrowserInput(rootNode) {
  this.rootNode = rootNode;
  this.caret = new Caret();
}

(function () {

  this._findFirstTextNode = function(el) {
    var i, c;
    if(el.nodeType === TEXT_NODE) {
      return el;
    }
    if(el.childNodes.length == 0) {
      return null;
    }
    for(i = 0; i < el.childNodes.length; i++) {
      c = this._findFirstTextNode(el.childNodes[i]);
      if(el.nodeType === TEXT_NODE) {
        return el;
      }
    }
    return null;
  }

}).call(BrowserInput.prototype);

module.exports = BrowserInput;
