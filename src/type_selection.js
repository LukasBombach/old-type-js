'use strict';

var TypeSelectionOverlay = require('./type_selection_overlay');

/**
 *
 * @constructor
 */
function TypeSelection() {
  this._overlays = [];
}

(function () {

  /**
   *
   * @param x
   * @param y
   * @returns {TypeSelection}
   */
  this.startAtPos = function (x, y) {
    this.unselect();
    this._overlays.push(new TypeSelectionOverlay(x, y, 0, 14));
    return this;
  };

  /**
   *
   * @param offset
   * @returns {TypeSelection}
   */
  this.startAtOffset = function (offset) {
    return this;
  };

  /**
   *
   * @param x
   * @param y
   * @returns {TypeSelection}
   */
  this.moveEndToPos = function (x, y) {
    this._overlays[0].update(null, null, x - this._overlays[0].x, y - this._overlays[0].y);
    return this;
  };

  /**
   *
   * @param offset
   * @returns {TypeSelection}
   */
  this.moveEndToOffset = function (offset) {
    return this;
  };


  /**
   *
   * @returns {TypeSelection}
   */
  this.unselect = function () {
    var i;
    for (i = 0; i < this._overlays.length; i += 1) {
      this._overlays[i].remove();
    }
    this._overlays = [];
    return this;
  };

  /**
   *
   * @returns {boolean}
   */
  this.exists = function () {
    return !!this._overlays.length && this._overlays[0].visible();
  };

}).call(TypeSelection.prototype);

module.exports = TypeSelection;
