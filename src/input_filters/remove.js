'use strict';

var TypeRange = require('../type_range');

/**
 * Creates a remove filter. Will catch backspace and del key
 * inputs and remove either the currently selected text or
 * the character next to the caret.
 *
 * @param {Type} type
 * @constructor
 */
function RemoveFilter(type) {
  this._root = type.getRoot();
  this._contents = type.getContents();
  this._caret = type.getCaret();
  this._selection = type.getSelection();
}

(function () {

  this.keys = {
    backspace : 'remove',
    del       : 'remove'
  };

  /**
   *
   * @param {TypeInputEvent} e
   */
  this.remove = function (e) {

    var range, newOffset, removeChars, moveChars;

    if (this._selection.collapsed()) {
      removeChars = e.key === 'backspace' ? -1 : 1;
      moveChars = e.key === 'backspace' ? -1 : 0;
      range = TypeRange.fromCaret(this._caret, removeChars);
      newOffset = this._caret.getOffset() + moveChars;
    } else {
      range = this._selection.getRange();
      newOffset = range.getStartOffset(this._root);
      this._selection.unselect();
      this._caret._blink();
    }

    this._caret.setOffset(newOffset);
    this._contents.remove(range);

    e.cancel();

  };


}).call(RemoveFilter.prototype);

module.exports = RemoveFilter;
