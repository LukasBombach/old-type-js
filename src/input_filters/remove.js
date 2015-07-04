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
  this._selection = type.getSelection();
  this._root = type.getRoot();
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

    var range, offset;

    if (this._selection.collapsed()) {
      range = TypeRange.fromCaret(this._caret, -1);
      offset = this._caret.getOffset() - 1;
    } else {
      range = TypeRange.fromRange(this._selection.getRange()); // todo TypeRange.fromSelection
      offset = range.getStartOffset(this._root);
      this._selection.unselect();
      this._caret._blink();
    }

    this._caret.setOffset(offset);
    this._contents.remove(range);

    e.cancel();

  };

}).call(RemoveFilter.prototype);

module.exports = RemoveFilter;
