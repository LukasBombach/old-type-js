'use strict';

var Input = require('../input');

/**
 * Creates a caret filter. Will catch arrow key inputs,
 * move the editor's caret and cancel the event.
 *
 * @param {Type} type
 * @param {Type.Input} [input]
 * @constructor
 */
Input.Filter.LineBreaks = function (type, input) {
  this._contents = type.getContents();
  this._caret = type.getCaret();
};

(function () {

  /**
   * This filter will react to enter keys
   * @type {{enter: string}}
   */
  this.keys = {
    enter  : 'insertLineBreak'
  };

  /**
   * Inserts a br tag
   * @param e
   */
  this.insertLineBreak = function (e) {
    var br = document.createElement('br');
    this._contents.insertHTML(this._caret.textNode, this._caret.offset, br);
    this._caret.moveRight();
    e.cancel();
  };


}).call(Input.Filter.LineBreaks.prototype);

module.exports = Input.Filter.LineBreaks;
