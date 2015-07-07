'use strict';

var Input = require('../input');

/**
 * Creates a remove filter. Will catch backspace and del key
 * inputs and remove either the currently selected text or
 * the character next to the caret.
 *
 * @param {Type} type
 * @param {Type.Input} [input]
 * @constructor
 */
Input.Filter.Remove = function (type, input) {
  this._root = type.getRoot();
  this._contents = type.getContents();
  this._caret = type.getCaret();
  this._selection = type.getSelection();
};

(function () {

  this.keys = {
    backspace : 'remove',
    del       : 'remove'
  };

  /**
   *
   * @param {Type.Events.Input} e
   */
  this.remove = function (e) {

    var range, newOffset, removeChars, moveChars;

    if (this._selection.collapsed()) {
      removeChars = e.key === 'backspace' ? -1 : 1;
      moveChars = e.key === 'backspace' ? -1 : 0;
      range = Type.Range.fromCaret(this._caret, removeChars);
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


}).call(Input.Filter.Remove.prototype);

module.exports = Input.Filter.Remove;
