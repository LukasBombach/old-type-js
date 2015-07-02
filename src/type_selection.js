'use strict';

var TypeRange = require('./type_range');
var TypeSelectionOverlay = require('./type_selection_overlay');

/**
 *
 * @constructor
 */
function TypeSelection() {
  this.unselect();
}

(function () {

  /**
   *
   * @param {number} x - Absolute horizontal position on the document
   * @param {number} y - Absolute vertical position on the document
   * @returns {TypeSelection} - This instance
   */
  this.beginAt = function (x, y) {
    this.unselect();
    this._setAnchor(x, y);
    return this._beginNewAt(this._anchor.node, this._anchor.offset);
  };

  /**
   *
   * @param {number} x - Absolute horizontal position on the document
   * @param {number} y - Absolute vertical position on the document
   * @returns {TypeSelection} - This instance
   */
  this.moveTo = function (x, y) {
    var range = document.caretRangeFromPoint(x, y);
    this._addElement(range.endContainer);
    if (x < this._anchor.x || y < this._anchor.y) {
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
    this._elements = {};
    this._range = null;
    this._anchor = null;
    this._start = null;
    this._end = null;
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
    //if (node === this._range.startContainer && offset === this._range.startOffset) {
    //  return this;
    //}
    this._range.setStart(node, offset);
    this._range.setEnd(this._anchor.node, this._anchor.offset);
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
    //if (node === this._range.endContainer && offset === this._range.endOffset) {
    //  return this;
    //}
    this._range.setStart(this._anchor.node, this._anchor.offset);
    this._range.setEnd(node, offset);
    this._imitateRangeAppending();
    return this;
  };

  /**
   * Sets the anchor node, offset and position in this screen for this selection.
   * When a user draws a selection, what is being selected depends on whether he /
   * she moves his / her mouse before or behind the point he / she started to draw
   * the selection. The information in the anchor needs to be saved to implement
   * this behaviour.
   *
   * @param {number} x - Absolute horizontal position on the document
   * @param {number} y - Absolute vertical position on the document
   * @returns {TypeSelection} - This instance
   * @private
   */
  this._setAnchor = function (x, y) {
    var range = document.caretRangeFromPoint(x, y);
    this._anchor = {x: x, y: y, node: range.startContainer, offset: range.startOffset};
    this._addElement(this._anchor.node);
    return this;
  };

  /**
   * Sets the start node and offset for this selection
   *
   * @param {Node} node - A text node
   * @param {number} offset - The character offset inside the text node
   * @returns {TypeSelection} - This instance
   * @private
   */
  this._setStart = function (node, offset) {
    this._start = {node: node, offset: offset};
    return this;
  };

  /**
   * Sets the end node and offset for this selection
   *
   * @param {Node} node - A text node
   * @param {number} offset - The character offset inside the text node
   * @returns {TypeSelection} - This instance
   * @private
   */
  this._setStart = function (node, offset) {
    this._end = {node: node, offset: offset};
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
    var rects = TypeRange.getClientRects(this._range),//this._range.getClientRects(),
      draw,
      overlay,
      i;

    // Resize and add overlays to match the range's rects
    for (i = rects.length - 1; i >= 0; i -= 1) {
      if (this._overlays[i]) {
        this._overlays[i].set(rects[i].left, rects[i].top, rects[i].right, rects[i].bottom);
      } else {
        draw = !this._matchesElementDimensions(rects[i]);
        overlay = new TypeSelectionOverlay(rects[i].left, rects[i].top, rects[i].right, rects[i].bottom, draw);
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
      draw,
      overlay,
      i;

    // Resize and add overlays to match the range's rects
    for (i = 0; i < rects.length; i += 1) {
      if (this._overlays[i]) {
        this._overlays[i].set(rects[i].left, rects[i].top, rects[i].right, rects[i].bottom);
      } else {
        draw = !this._matchesElementDimensions(rects[i]);
        overlay = new TypeSelectionOverlay(rects[i].left, rects[i].top, rects[i].right, rects[i].bottom, draw);
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
   * Todo scrolling
   *
   * @param {Node|Element} el - An element or a text node
   * @returns {TypeSelection} - This instance
   * @private
   */
  this._addElement = function (el) {
    var rect, key;
    el = el.nodeType === 3 ? el.parentNode : el;
    rect = el.getBoundingClientRect();
    key = this._stringifyRect(rect);
    this._elements[key] = rect;
    return this;
  };

  /**
   *
   * @param {ClientRect} rect
   * @private
   */
  this._matchesElementDimensions = function (rect) {
    var key = this._stringifyRect(rect);
    return this._elements.hasOwnProperty(key);
  };

  /**
   * Removes all selection overlays
   *
   * @returns {TypeSelection} - This instance
   * @private
   */
  this._removeOverlays = function () {
    var i;
    if (!this._overlays) {
      this._overlays = [];
    }
    for (i = 0; i < this._overlays.length; i += 1) {
      this._overlays[i].remove();
    }
    this._overlays = [];
    return this;
  };

  /**
   *
   * @param {ClientRect} rect
   * @returns {string}
   * @private
   */
  this._stringifyRect = function (rect) {
    var top  = rect.top.toString(),
      left   = rect.left.toString(),
      bottom = rect.bottom.toString(),
      right  = rect.right.toString();
    return top + left + bottom + right;
  };

}).call(TypeSelection.prototype);

module.exports = TypeSelection;
