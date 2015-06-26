'use strict';

var TypeRange = require('../type_range');


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

  /**
   *
   * @param {TypeInputEvent} e
   */
  this.backspace = function (e) {

    var range = TypeRange.fromCurrentSelection();

    if (range === null) {
      this._contents.remove(this._caret.textNode, this._caret.offset, -1);
      this._caret.moveLeft();
    } else {
      this._contents.removeRange(range);
    }

    e.cancel();

  };

}).call(RemoveFilter.prototype);

module.exports = RemoveFilter;
