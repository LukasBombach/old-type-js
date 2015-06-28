'use strict';

var TypeSelectionOverlay = require('./type_selection_overlay');

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
  this.start = function (x, y) {
    this.unselect();
    this._overlays.push(new TypeSelectionOverlay(x, y, 0, 14));
    return this;
  };

  /**
   *
   * @param x
   * @param y
   * @returns {TypeSelection}
   */
  this.moveEnd = function (x, y) {
    this._overlays[0].update(null, null, x - this._overlays[0].x, y - this._overlays[0].y);
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
    return !!this._overlays.length;
  };

}).call(TypeSelection.prototype);



module.exports = TypeSelection;
