'use strict';

var DomUtil = require('./dom_utilities');

/**
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

module.exports = TypeSelectionOverlay;
