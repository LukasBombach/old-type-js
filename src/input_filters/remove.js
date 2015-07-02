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

    var range;

    if (this._selection.collapsed()) {
      this._contents.remove(this._caret.textNode, this._caret.offset, -1);
      this._caret.moveLeft();
    } else {
      range = TypeRange.fromRange(this._selection.getRange()); // todo TypeRange.fromSelection
      this._caret.moveTo(range.startContainer, range.startOffset); // todo do not use native low level stuff
      this._selection.unselect();
      this._caret._blink();
      this._contents.removeRange(range);
    }

    e.cancel();

  };

}).call(RemoveFilter.prototype);

module.exports = RemoveFilter;
