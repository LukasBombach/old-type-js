'use strict';

var Util = require('./utilities');
var TypeSelectionOverlay = require('./type_selection_overlay');

/**
 *
 * @constructor
 */
function TypeSelection() {
  this._overlays = [];
  this._start = null;
  this._end = null;
}

(function () {

  /**
   *
   * @param x
   * @param y
   * @returns {TypeSelection}
   */
  this.beginNewAtPos = function (x, y) {
    this.unselect();
    this._start = this._posToNodeOffset(x, y);
    this._end = Util.extend({}, this._start);
    this._overlays.push(new TypeSelectionOverlay(x, y, 0, 14));
    return this;
  };

  /**
   *
   * @param offset
   * @returns {TypeSelection}
   */
  this.beginNewAtOffset = function (offset) {
    return this;
  };

  /**
   * Todo maybe not use this._posToNodeOffset every time for performance reasons
   * @param x
   * @param y
   * @returns {TypeSelection}
   */
  this.moveEndToPos = function (x, y) {
    this._overlays[0].update(null, null, x - this._overlays[0].x, y - this._overlays[0].y);
    this._end = this._posToNodeOffset(x, y);
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
    this._start = null;
    this._end = null;
    return this;
  };

  /**
   *
   * @returns {boolean}
   */
  this.exists = function () {
    return !!this._overlays.length && this._overlays[0].visible();
  };

  /**
   * todo https://developer.mozilla.org/en-US/docs/Web/API/document/caretRangeFromPoint
   * todo https://gist.github.com/unicornist/ac997a15bc3211ba1235
   *
   * @param x
   * @param y
   * @returns {{node: Node, offset: number}}
   * @private
   */
  this._posToNodeOffset = function (x, y) {
    var range = document.caretRangeFromPoint(x, y);
    return {
      node: range.startContainer,
      offset: range.startOffset
    };
  };

}).call(TypeSelection.prototype);

module.exports = TypeSelection;
