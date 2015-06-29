'use strict';

var DomUtil = require('./dom_utilities');

/**
 *
 * todo internal differenciation of x and y and scroll positions for easier redrawing
 *
 * @param {number} [x] - Horizontal position of the overlay
 * @param {number} [y] - Vertical position of the overlay
 * @param {number} [width] - Width of the overlay
 * @param {number} [height] - Height of the overlay
 * @param {boolean} [draw] - Set to false if you do not wish
 *     for the element to be shown. Defaults to true
 * @constructor
 */
function TypeSelectionOverlay(x, y, width, height, draw) {
  this._el = this._createElement();
  if (draw !== false) this._draw(x, y, width, height);
  this._set(x, y, width, height);
}

(function () {

  /**
   * Will set the position and dimension values and update
   * the div styles
   *
   * @param {number} [x] - Horizontal position of the overlay
   * @param {number} [y] - Vertical position of the overlay
   * @param {number} [width] - Width of the overlay
   * @param {number} [height] - Height of the overlay
   * @returns {TypeSelectionOverlay} - This instance
   */
  this.update  = function (x, y, width, height) {
    this._draw(x, y, width, height);
    this._set(x, y, width, height);
    return this;
  };

  /**
   * Returns whether or not this overlay is actually visible
   *
   * @returns {boolean}
   */
  this.visible = function () {
    return !(this.width === 0 || this.height === 0);
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
    this.x = null;
    this.y = null;
    this.width = null;
    this.height = null;
    return this;
  };

  /**
   * Sets all dimension and position values to the given
   * values unless null is given
   *
   * @param {number} [x] - Horizontal position of the overlay
   * @param {number} [y] - Vertical position of the overlay
   * @param {number} [width] - Width of the overlay
   * @param {number} [height] - Height of the overlay
   * @returns {TypeSelectionOverlay} - This instance
   * @private
   */
  this._set = function (x, y, width, height) {
    this.x = x !== null ? x : this.x;
    this.y = y !== null ? y : this.y;
    this.width = width !== null ? width : this.width;
    this.height = height !== null ? height : this.height;
    return this;
  };

  /**
   * Sets dimension and position values to th element's style
   * unless they are not different to the current values.
   *
   * @param {number} [x] - Horizontal position of the overlay
   * @param {number} [y] - Vertical position of the overlay
   * @param {number} [width] - Width of the overlay
   * @param {number} [height] - Height of the overlay
   * @returns {TypeSelectionOverlay} - This instance
   * @private
   */
  this._draw = function (x, y, width, height) {
    if (x !== null && x !== this.x) this._el.style.left = x + 'px';
    if (y !== null && y !== this.y) this._el.style.top = y + 'px';
    if (width !== null && width !== this.width) this._el.style.width = width + 'px';
    if (height !== null && height !== this.height) this._el.style.height = height + 'px';
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
  var rect = TypeSelectionOverlay._getPositionsFromRange(range),
    width  = rect.right - rect.left,
    height = rect.bottom - rect.top;
  return new TypeSelectionOverlay(rect.left, rect.top, width, height);
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
