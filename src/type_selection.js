'use strict';

var TypeSelectionOverlay = require('./type_selection_overlay');

/**
 *
 * @param {Type} type
 * @constructor
 */
function TypeSelection(type) {
  this._root = type.getRoot();
  this._rootRect = this._root.getBoundingClientRect();
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
    var range = this._rangeFromOffset(x, y);
    this.unselect();
    this._start = this._nodeAndOffset(range);
    this._end = this._nodeAndOffset(range);
    this._overlays.push(TypeSelectionOverlay.fromRange(range));
    return this;
  };

  this.selectToPos = function (x, y) {
    if (y < this._overlays[0].y) {
      this.moveStartToPos(x, y);
    } else {
      this.moveEndToPos(x, y);
    }
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

    var last = this._overlays[this._overlays.length - 1],
      range, newOverlay;

    // Cursor is above last selected line
    if (y < last.y1) {

    }

    // Cursor is horizontally aligned with last selected line
    if (y >= last.y1 && y <= last.y2) {
      last.setX(x);
    }

    // Cursor is below last selected line
    if (y > last.y2) {
      last.set(this._rootRect.left, null, this._rootRect.right, null);
      range = this._rangeFromOffset(x, y);
      newOverlay = TypeSelectionOverlay.fromRange(range);
      newOverlay.set(this._rootRect.left);
      this._overlays.push(newOverlay);
    }

    //this._overlays[0].update(null, null, x - this._overlays[0].x, y - this._overlays[0].y);
    //this._end = this._posToNodeOffset(x, y);

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

  this._addOverlay = function () {

  };

  /**
   * todo https://developer.mozilla.org/en-US/docs/Web/API/document/caretRangeFromPoint
   * todo https://gist.github.com/unicornist/ac997a15bc3211ba1235
   *
   * @param x
   * @param y
   * @returns {*}
   * @private
   */
  this._rangeFromOffset = function (x, y) {
    return document.caretRangeFromPoint(x, y);
  };

  /**
   *
   * @param range
   * @returns {{node: Node, offset: number}}
   * @private
   */
  this._nodeAndOffset = function (range) {
    return {
      node: range.startContainer,
      offset: range.startOffset
    };
  };

}).call(TypeSelection.prototype);

module.exports = TypeSelection;
