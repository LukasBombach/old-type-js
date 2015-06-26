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
   */
  this.moveLeft = function () {
    this._caret.moveLeft();
  };

  /**
   * Moves the caret up
   */
  this.moveUp = function () {
    this._caret.moveUp();
  };

  /**
   * Moves the caret right
   */
  this.moveRight = function () {
    this._caret.moveRight();
  };

  /**
   * Moves the caret down
   */
  this.moveDown = function () {
    this._caret.moveDown();
  };

}).call(CaretFilter.prototype);

module.exports = CaretFilter;
