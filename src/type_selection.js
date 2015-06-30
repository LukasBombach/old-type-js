'use strict';

var TypeSelectionOverlay = require('./type_selection_overlay');

/**
 *
 * @constructor
 */
function TypeSelection() {
  this._overlays = [];
  this._range = null;
  this._startPos = null;
}

(function () {

  /**
   *
   * @param {number} x - Absolute horizontal position on the document
   * @param {number} y - Absolute vertical position on the document
   * @returns {TypeSelection} - This instance
   */
  this.beginAt = function (x, y) {
    var range = document.caretRangeFromPoint(x, y);
    this.unselect();
    this._startPos = {x: x, y: y};
    return this._beginNewAt(range.startContainer, range.startOffset);
  };

  /**
   *
   * @param {number} x - Absolute horizontal position on the document
   * @param {number} y - Absolute vertical position on the document
   * @returns {TypeSelection} - This instance
   */
  this.moveTo = function (x, y) {
    var range = document.caretRangeFromPoint(x, y);
    if (x < this._startPos.x || y < this._startPos.y) {
      this._moveStartTo(range.endContainer, range.endOffset);
    } else {
      this._moveEndTo(range.endContainer, range.endOffset);
    }
    return this;
  };

  /**
   * Removes all selection overlays and resets internal variables
   *
   * @returns {TypeSelection} - This instance
   */
  this.unselect = function () {
    this._removeOverlays();
    this._range = null;
    this._startPos = null;
    return this;
  };

  /**
   * Returns whether or not this selection is visible
   *
   * @returns {boolean}
   */
  this.exists = function () {
    return !!this._overlays.length && this._overlays[0].visible();
  };

  /**
   *
   * @param {Node} node - The text node that the selection should start in
   * @param {number} offset - The offset in the text node that the selection should start in
   * @returns {TypeSelection} - This instance
   */
  this._beginNewAt = function (node, offset) {
    this._range = window.document.createRange();
    this._range.setStart(node, offset);
    this._range.setEnd(node, offset);
    return this;
  };

  /**
   *
   * @param {Node} node - The text node that the selection should end in
   * @param {number} offset - The offset in the text node that the selection should end in
   * @returns {TypeSelection} - This instance
   */
  this._moveStartTo = function (node, offset) {
    if (node === this._range.startContainer && offset === this._range.startOffset) {
      return this;
    }
    this._range.setStart(node, offset);
    this._range.setEnd(this._range.endContainer, this._range.endOffset);
    this._imitateRangePrepending();
    return this;
  };

  /**
   *
   * @param {Node} node - The text node that the selection should end in
   * @param {number} offset - The offset in the text node that the selection should end in
   * @returns {TypeSelection} - This instance
   */
  this._moveEndTo = function (node, offset) {
    if (node === this._range.endContainer && offset === this._range.endOffset) {
      return this;
    }
    this._range.setStart(this._range.startContainer, this._range.startOffset);
    this._range.setEnd(node, offset);
    this._imitateRangeAppending();
    return this;
  };

  /**
   * Creates {TypeSelectionOverlay}s that mimic the appearance of
   * the selection as drawn by {this._range}
   *
   * @returns {TypeSelection} - This instance
   * @private
   */
  this._imitateRangePrepending = function () {

    // Required variables
    var rects = this._range.getClientRects(),
      overlay,
      i;

    // Resize and add overlays to match the range's rects
    for (i = rects.length - 1; i >= 0; i -= 1) {
      if (this._overlays[i]) {
        this._overlays[i].set(rects[i].left, rects[i].top, rects[i].right, rects[i].bottom);
      } else {
        overlay = new TypeSelectionOverlay(rects[i].left, rects[i].top, rects[i].right, rects[i].bottom);
        this._overlays.unshift(overlay);
      }
    }

    // Remove overlays prepending the current range's rects
    while (this._overlays.length > rects.length) {
      this._overlays.shift().remove();
    }

    // Chaining
    return this;

  };

  /**
   * Creates {TypeSelectionOverlay}s that mimic the appearance of
   * the selection as drawn by {this._range}
   *
   * @returns {TypeSelection} - This instance
   * @private
   */
  this._imitateRangeAppending = function () {

    // Required variables
    var rects = this._range.getClientRects(),
      overlay,
      i;

    // Resize and add overlays to match the range's rects
    for (i = 0; i < rects.length; i += 1) {
      if (this._overlays[i]) {
        this._overlays[i].set(rects[i].left, rects[i].top, rects[i].right, rects[i].bottom);
      } else {
        overlay = new TypeSelectionOverlay(rects[i].left, rects[i].top, rects[i].right, rects[i].bottom);
        this._overlays.push(overlay);
      }
    }

    // Remove overlays coming after the current range's rects
    while (this._overlays.length > rects.length) {
      this._overlays.pop().remove();
    }

    // Chaining
    return this;

  };

  /**
   * Removes all selection overlays
   *
   * @returns {TypeSelection} - This instance
   * @private
   */
  this._removeOverlays = function () {
    var i;
    for (i = 0; i < this._overlays.length; i += 1) {
      this._overlays[i].remove();
    }
    this._overlays = [];
    return this;
  };

}).call(TypeSelection.prototype);

module.exports = TypeSelection;
