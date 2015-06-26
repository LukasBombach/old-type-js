'use strict';

var Type = require('../core');

/**
 *
 * @param {Type} type
 * @param {TypeInput} input
 * @constructor
 */
function RemoveFilter(type, input) {
  this._contents = type.getContents();
  this._caret = type.getCaret();
}

(function () {

  this.keys = {
    backspace : 'backspace'
  };

  this.backspace = function () {
    this._contents.remove(this._caret.textNode, this._caret.offset, -1);
    this._caret.moveLeft();
  };

}).call(RemoveFilter.prototype);

module.exports = RemoveFilter;
