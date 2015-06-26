'use strict';

var Type = require('../core');

/**
 *
 * @param {Type} type
 * @constructor
 */
function CaretFilter(type) {
  this._caret = type.getCaret();
}

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
   * @param {TypeInputEvent} e
   */
  this.moveLeft = function (e) {
    this._caret.moveLeft();
    e.cancel();
  };

  /**
   * Moves the caret up
   *
   * @param {TypeInputEvent} e
   */
  this.moveUp = function (e) {
    this._caret.moveUp();
    e.cancel();
  };

  /**
   * Moves the caret right
   *
   * @param {TypeInputEvent} e
   */
  this.moveRight = function (e) {
    this._caret.moveRight();
    e.cancel();
  };

  /**
   * Moves the caret down
   *
   * @param {TypeInputEvent} e
   */
  this.moveDown = function (e) {
    this._caret.moveDown();
    e.cancel();
  };

}).call(CaretFilter.prototype);

module.exports = CaretFilter;
