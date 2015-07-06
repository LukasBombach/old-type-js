'use strict';

var Input = require('../input');

/**
 * Creates a caret filter. Will catch arrow key inputs,
 * move the editor's caret and cancel the event.
 *
 * @param {Type} type
 * @constructor
 */
Input.Filter.Caret = function (type) {
  this._caret = type.getCaret();
};

(function () {

  this.keys = {
    left  : 'moveLeft',
    up    : 'moveUp',
    right : 'moveRight',
    down  : 'moveDown'
  };

  /**
   * Moves the caret left
   *
   * @param {Type.Events.Input} e
   */
  this.moveLeft = function (e) {
    this._caret.moveLeft();
    e.cancel();
  };

  /**
   * Moves the caret up
   *
   * @param {Type.Events.Input} e
   */
  this.moveUp = function (e) {
    this._caret.moveUp();
    e.cancel();
  };

  /**
   * Moves the caret right
   *
   * @param {Type.Events.Input} e
   */
  this.moveRight = function (e) {
    this._caret.moveRight();
    e.cancel();
  };

  /**
   * Moves the caret down
   *
   * @param {Type.Events.Input} e
   */
  this.moveDown = function (e) {
    this._caret.moveDown();
    e.cancel();
  };

}).call(Input.Filter.Caret.prototype);

module.exports = Input.Filter.Caret;
