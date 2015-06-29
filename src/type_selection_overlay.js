'use strict';

var DomUtil = require('./dom_utilities');

/**
 *
 * todo internal differenciation of x and y *and scroll positions* for easier redrawing
 *
 * @param {number} [x1] - Horizontal position of the overlay
 * @param {number} [y1] - Vertical position of the overlay
 * @param {number} [x2] - x2 of the overlay
 * @param {number} [y2] - y2 of the overlay
 * @param {boolean} [draw] - Set to false if you do not wish
 *     for the element to be shown. Defaults to true
 * @constructor
 */
function TypeSelectionOverlay(x1, y1, x2, y2, draw) {
  this._el = this._createElement();
  if (draw !== false) this._draw(x1, y1, x2, y2);
  this._setValues(x1, y1, x2, y2);
  this._anchor = {x: x1, y: y1};
}

(function () {

  /**
   * Will set the position and dimension values and update
   * the div styles
   *
   * @param {number} [x1] - Horizontal position of the overlay
   * @param {number} [y1] - Vertical position of the overlay
   * @param {number} [x2] - x2 of the overlay
   * @param {number} [y2] - y2 of the overlay
   * @returns {TypeSelectionOverlay} - This instance
   */
  this.set  = function (x1, y1, x2, y2) {
    this._draw(x1, y1, x2, y2);
    this._setValues(x1, y1, x2, y2);
    return this;
  };


  /**
   * Sets the horizontal start or end of this overlay depending
   * whether the value given is left or right of the anchor.
   * Will also set the other end to the anchor's position.
   *
   * @param {number} x - The horizontal position
   * @returns {TypeSelectionOverlay} - This instance
   */
  this.setX = function (x) {
    if (x < this._anchor.x) this.set(x, null, this._anchor.x, null);
    if (x > this._anchor.x) this.set(this._anchor.x, null, x, null);
    return this;
  };

  /**
   * Returns whether or not this overlay is actually visible
   *
   * @returns {boolean}
   */
  this.visible = function () {
    return !(this.x1 === this.x2 || this.y1 === this.y2);
  };

  /**
   * Removes the overlay div and resets all position and
   * dimension values
   *
   * @returns {TypeSelectionOverlay} - This instance
   */
  this.remove = function () {
    DomUtil.removeElement(this._el);
    this._el = null;
    this.x1 = null;
    this.y1 = null;
    this.x2 = null;
    this.y2 = null;
    return this;
  };

  /**
   * Sets all dimension and position values to the given
   * values unless null is given
   *
   * @param {number} [x1] - Horizontal position of the overlay
   * @param {number} [y1] - Vertical position of the overlay
   * @param {number} [x2] - x2 of the overlay
   * @param {number} [y2] - y2 of the overlay
   * @returns {TypeSelectionOverlay} - This instance
   * @private
   */
  this._setValues = function (x1, y1, x2, y2) {
    if (x1 !== null) this.x1 = x1;
    if (y1 !== null) this.y1 = y1;
    if (x2 !== null) this.x2 = x2;
    if (y2 !== null) this.y2 = y2;
    return this;
  };

  /**
   * Sets dimension and position values to th element's style
   * unless they are not different to the current values.
   *
   * @param {number} [x1] - Horizontal position of the overlay
   * @param {number} [y1] - Vertical position of the overlay
   * @param {number} [x2] - x2 of the overlay
   * @param {number} [y2] - y2 of the overlay
   * @returns {TypeSelectionOverlay} - This instance
   * @private
   */
  this._draw = function (x1, y1, x2, y2) {

    // If x1 has changed, reposition
    if (x1 !== null && x1 !== this.x1) {
      this._el.style.left   = x1 + 'px';
    }

    // If x1 or x2 have changed, recalculate the width
    if ((x1 !== null && x1 !== this.x1) || (x2 !== null && x2 !== this.x2)) {
      x1 = x1 !== null ? x1 : this.x1;
      x2 = x2 !== null ? x2 : this.x2;
      this._el.style.width  = (x2-x1) + 'px';
    }

    // If y1 has changed, reposition
    if (y1 !== null && y1 !== this.y1) {
      this._el.style.top   = y1 + 'px';
    }

    // If y1 or y2 have changed, recalculate the height
    if ((y1 !== null && y1 !== this.y1) || (y2 !== null && y2 !== this.y2)) {
      y1 = y1 !== null ? y1 : this.y1;
      y2 = y2 !== null ? y2 : this.y2;
      this._el.style.height  = (y2-y1) + 'px';
    }

    return this;
  };

  /**
   * Creates and returns the visible selection overlay element
   *
   * @returns {Element}
   * @private
   */
  this._createElement = function () {
    return DomUtil.addElement('div', 'selection');
  };

}).call(TypeSelectionOverlay.prototype);

/**
 *
 * @param {Range} range
 * @returns {TypeSelectionOverlay}
 */
TypeSelectionOverlay.fromRange = function (range) {
  var rect = TypeSelectionOverlay._getPositionsFromRange(range);
  return new TypeSelectionOverlay(rect.left, rect.top, rect.right, rect.bottom);
};

/**
 * Return's the window's horizontal an vertical scroll positions
 *
 * todo code duplication to caret._getScrollPosition
 *
 * @returns {{top: (number), left: (number)}}
 * @private
 */
TypeSelectionOverlay._getScrollPosition = function () {
  return {
    top  : window.pageYOffset || document.documentElement.scrollTop,
    left : window.pageXOffset || document.documentElement.scrollLeft
  };
};

/**
 * Returns the positions from a {ClientRect} relative to the scroll
 * position
 *
 * todo code duplication to caret._getPositionsFromRange
 *
 * @param {Range} range The {Range} that should be measured
 * @returns {{top: number, right: number, bottom: number, left: number}}
 * @private
 */

TypeSelectionOverlay._getPositionsFromRange = function (range) {
  var scroll = TypeSelectionOverlay._getScrollPosition();
  var rect = range.getClientRects()[0];
  if(!rect) {
    return null;
  }
  return {
    top    : rect.top + scroll.top,
    right  : rect.right + scroll.left,
    bottom : rect.bottom + scroll.top,
    left   : rect.left + scroll.left
  };
};

module.exports = TypeSelectionOverlay;
