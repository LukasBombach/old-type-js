'use strict';

var TypeRange = require('./type_range');
var TypeSelectionOverlay = require('./type_selection_overlay');

/**
 *
 * @constructor
 */
function TypeSelection() {
  this._init();
}

(function () {

  /**
   * Resets (removes) the current selection if there is one, sets a new anchor at
   * the given coordinates and sets up a new selection at the node and offset found
   * at the coordinates.
   *
   * @param {number} x - Absolute horizontal position on the document
   * @param {number} y - Absolute vertical position on the document
   * @returns {TypeSelection} - This instance
   */
  this.beginAt = function (x, y) {
    this.unselect();
    this._setAnchor(x, y);
    return this._startRangeAt(this._anchor.node, this._anchor.offset);
  };

  /**
   * Will move the end or the start of the selection to the node and offset found at
   * the given coordinates. Whether the start or the end will be moved depends on
   * whether the coordinates are on top / left of this selection's anchor or below /
   * right of it.
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
   * todo we should really use type ranges and much of this implementation should go there
   * todo this does not work when spanning over multiple text nodes (for instance in case of formatting)
   * todo since multiple nodes making up a single text or sometimes even words, maybe there should be an abstraction and layer / class for this
   * @param x
   * @param y
   * @returns {*}
   */
  this.selectWordAt = function (x, y) {

    var charAtStart, charAtEnd,
      whitespace = new RegExp('\\s'),
      endLength = this._range.endContainer.nodeValue.length,
      startOffset = this._range.startOffset,
      endOffset = this._range.endOffset,
      startFound = false,
      endFound = false;

    this.beginAt(x, y);

    do {
      charAtStart = this._range.startContainer.nodeValue.charAt(this._range.startOffset - 1);

      if (startOffset > 1 && !whitespace.test(charAtStart)) {
        if (startOffset > 1) {
          startOffset -= 1;
          this._range.setStart(this._range.startContainer, startOffset);
        }
      } else {
        startFound = true;
      }

    } while (!startFound);

    do {
      charAtEnd = this._range.endContainer.nodeValue.charAt(this._range.endOffset);

      if (endOffset < endLength && !whitespace.test(charAtEnd)) {
        if (endOffset < endLength) {
          endOffset += 1;
          this._range.setEnd(this._range.endContainer, endOffset);
        }
      } else {
        endFound = true;
      }

    } while (!endFound);

    this._imitateRangeAppending();

    return this;
  };

  /**
   * Removes all selection overlays and resets internal variables.
   * @returns {TypeSelection} - This instance
   */
  this.unselect = function () {
    this._removeOverlays();
    this._elements = {};
    this._range = null;
    this._anchor = null;
    return this;
  };

  /**
   * Returns the {Range} this selection spans over or null if nothing has been
   * selected yet.
   * @returns {Range|null}
   */
  this.getNativeRange = function () {
    return this._range;
  };

  /**
   * Returns the start node and offset of this selection.
   * @returns {{node: Node, offset: number}|null}
   */
  this.getStart = function () {
    if (this._range) {
      return {node: this._range.startContainer, offset: this._range.startOffset};
    }
    return null;
  };

  /**
   * Returns the end node and offset of this selection.
   * @returns {{node: Node, offset: number}|null}
   */
  this.getEnd = function () {
    if (this._range) {
      return {node: this._range.endContainer, offset: this._range.endOffset};
    }
    return null;
  };

  /**
   * Returns whether or not this selection is visible. By checking if there currently
   * are any overlays and if the first overlay is actually visible. There should be
   * no case where there are visible overlays but the first overlay wouldn't be visible,
   * so this is a quick and performant way to check for the selection's visibility.
   *
   * @returns {boolean} - True if selection is hidden, false if there is a selection
   */
  this.collapsed = function () {
    return !this._overlays.length || !this._overlays[0].visible();
  };

  /**
   * Alias method for select() for better code readability. For initialization
   * all variables should be set to their default values. This is what select
   * does for us.
   *
   * @returns {TypeSelection} - This instance
   * @private
   */
  this._init = function () {
    return this.unselect();
  };

  /**
   * Creates a new {Range}, which will be the basis for drawing and this selection.
   * todo Use {TypeRange}? Should be cool if we don't use getRects or we make TypeRange more performant
   *
   * @param {Node} node - The text node that the selection should start in
   * @param {number} offset - The offset in the text node that the selection should start in
   * @returns {TypeSelection} - This instance
   */
  this._startRangeAt = function (node, offset) {
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
    this._overlays = this._overlays || [];
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
