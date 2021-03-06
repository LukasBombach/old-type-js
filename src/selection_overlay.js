'use strict';

var Type = require('./core');

/**
 *
 * todo internal differenciation / abstraction of x and y *and scroll positions* for easier redrawing
 *
 * @param {number} [x1] - Horizontal position of the overlay
 * @param {number} [y1] - Vertical position of the overlay
 * @param {number} [x2] - x2 of the overlay
 * @param {number} [y2] - y2 of the overlay
 * @param {boolean} [show] - Set to false if you do not wish
 *     for the element to be shown. Defaults to true
 * @constructor
 */
Type.SelectionOverlay = function (x1, y1, x2, y2, show) {
  if (show !== false) {
    this.show(x1, y1, x2, y2);
  }
  this._setValues(x1, y1, x2, y2);
  this._anchor = {x: x1, y: y1};
};

(function () {

  /**
   * Will set the position and dimension values and update
   * the div styles
   *
   * @param {number|string} [x1] - Horizontal position of the overlay
   *     or either one of the strings 'left', 'right' or 'line', which
   *     will span the overlay to the left side of the line of the
   *     textNode, the right side or the entire line
   * @param {number} [y1] - Vertical position of the overlay
   * @param {number} [x2] - x2 of the overlay
   * @param {number} [y2] - y2 of the overlay
   * @returns {Type.SelectionOverlay} - This instance
   */
  this.set  = function (x1, y1, x2, y2) {

    if (x1 === 'left') {
      x1 = this._textleft();
      x2 = null;
    }

    if (x1 === 'right') {
      x1 = null;
      x2 = this._textRight();
    }

    if (x1 === 'line') {
      x1 = this._textleft();
      x2 = this._textRight();
    }

    x1 = x1 === undefined ? null : x1;
    y1 = y1 === undefined ? null : y1;
    x2 = x2 === undefined ? null : x2;
    y2 = y2 === undefined ? null : y2;

    this._draw(x1, y1, x2, y2);
    this._setValues(x1, y1, x2, y2);

    return this;
  };

  /**
   *
   * @param x1
   * @param y1
   * @param x2
   * @param y2
   * @returns {Type.SelectionOverlay} - This instance
   */
  this.show = function (x1, y1, x2, y2) {
    this._el = this._createElement();
    this._draw(x1, y1, x2, y2);
    return this;
  };

  /**
   *
   * @returns {Type.SelectionOverlay} - This instance
   */
  this.hide = function () {
    Type.DomUtilities.removeElement(this._el);
    this._el = null;
    return this;
  };

  /**
   *
   * @param {number|string} x
   * @param {number} [y]
   * @returns {Type.SelectionOverlay} - This instance
   */
  /*this.anchor = function (x, y) {

    if (x === 'left') {
      x = this._textleft();
      y = null;
    }

    if (x === 'right') {
      x = this._textRight();
      y = null;
    }

    if (x !== null && x !== undefined) {
      this._anchor.x = x;
    }

    if (y !== null && y !== undefined) {
      this._anchor.y = y;
    }

    return this;

  };*/

  /**
   * Sets the horizontal start or end of this overlay depending
   * whether the value given is left or right of the anchor.
   * Will also set the other end to the anchor's position.
   *
   * @param {number} x - The horizontal position
   * @returns {Type.SelectionOverlay} - This instance
   */
  /*this.setXFromAnchor = function (x) {
    if (x === null || x === undefined) {
      this.set(this._anchor.x, null, this._anchor.x, null);
    } else {
      if (x < this._anchor.x) this.set(x, null, this._anchor.x, null);
      if (x > this._anchor.x) this.set(this._anchor.x, null, x, null);
    }
    return this;
  };*/

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
   * @returns {Type.SelectionOverlay} - This instance
   */
  this.remove = function () {
    if (this._el) {
      Type.DomUtilities.removeElement(this._el);
    }
    this._el = null;
    this.x1 = null;
    this.y1 = null;
    this.x2 = null;
    this.y2 = null;
    this._anchor = null;
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
   * @returns {Type.SelectionOverlay} - This instance
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
   * @returns {Type.SelectionOverlay} - This instance
   * @private
   */
  this._draw = function (x1, y1, x2, y2) {

    if (!this._el) {
      return this;
    }

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
    return Type.DomUtilities.addElement('div', 'selection');
  };

}).call(Type.SelectionOverlay.prototype);

/**
 *
 * @param {Range} range
 * @returns {Type.SelectionOverlay}
 */
Type.SelectionOverlay.fromRange = function (range) {
  var rect = Type.SelectionOverlay._getPositionsFromRange(range);
  return new Type.SelectionOverlay(rect.left, rect.top, rect.right, rect.bottom, true, range.startContainer);
};

/**
 *
 * @param x
 * @param y
 * @returns {Type.SelectionOverlay}
 * @deprecated
 */
//Type.SelectionOverlay.fromPosition = function (x, y) {
//  var range = document.caretRangeFromPoint(x, y);
//  return Type.SelectionOverlay.fromRange(range)
//};

/**
 * Return's the window's horizontal an vertical scroll positions
 *
 * todo code duplication to caret._getScrollPosition
 *
 * @returns {{top: (number), left: (number)}}
 * @private
 */
Type.SelectionOverlay._getScrollPosition = function () {
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

Type.SelectionOverlay._getPositionsFromRange = function (range) {
  var scroll = Type.SelectionOverlay._getScrollPosition();
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

module.exports = Type.SelectionOverlay;
