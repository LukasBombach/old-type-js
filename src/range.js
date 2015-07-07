'use strict';

var Type = require('./core');

/**
 * Crates a new Type.Range
 *
 * Type.Range is a shim for the browsers' native {Range} objects and
 * is being used in Type for anything related to text ranges.
 *
 * Native ranges are often buggy, lack essential features and should
 * not be used other than for performance reasons. This class avoids
 * and / or fixes common issues with ranges and adds many methods
 * useful for text editing.
 *
 * Among many other factory methods, you can use the {Type.Range.fromRange}
 * method to create a {Type.Range} from a native {Range}.
 *
 * @param {Node} startContainer - A text node that the range should start in.
 * @param {number} startOffset - The offset (of characters) inside the
 *     startContainer where the range should begin.
 * @param {Node} endContainer - A text node that the range should end in.
 * @param {number} endOffset - The offset (of characters) inside the
 *     endContainer where the range should stop.
 * @constructor
 */
Type.Range = function (startContainer, startOffset, endContainer, endOffset) {

  this.startContainer = startContainer;
  this.startOffset    = startOffset;
  this.endContainer   = endContainer;
  this.endOffset      = endOffset;

  this.ensureStartNodePrecedesEndNode();

};

(function () {

  /**
   * If the startContainer and the endContainer are enclosed by
   * the same element matching the selector, that element will
   * be returned. Otherwise null will be returned.
   *
   * todo call this commonAncestor and make the selector optional
   *
   * @param {String} selector - This method will only return a
   *     common ancestor matched by this selector.
   * @param {HTMLElement} [constrainingNode] - If given, this
   *     method will stop traversing the DOM tree when it hits
   *     this element.
   * @returns {HTMLElement|null} - Will either return the common
   *     ancestor matching the selector or null otherwise.
   */
  this.elementEnclosingStartAndEnd = function (selector, constrainingNode) {

    var tagEnclosingStartNode = Type.DomUtilities.parent(this.startContainer, selector, constrainingNode),
      tagEnclosingEndNode;

    if (tagEnclosingStartNode === null) {
      return null;
    }

    tagEnclosingEndNode = Type.DomUtilities.parent(this.endContainer, selector, constrainingNode);

    if (tagEnclosingStartNode === tagEnclosingEndNode) {
      return tagEnclosingStartNode;
    }

    return null;
  };

  /**
   * Will return whether or not the whole range (the
   * startContainer and the endContainer are both children
   * of the given element.
   *
   * @param {Node} node - The node to check if it
   *     is a parent to the start and endContainer.
   * @returns {boolean}
   */
  this.isInside = function (node) {
    return node.contains(this.startContainer) && node.contains(this.endContainer);
  };

  /**
   * Will throw an error if the start and endContainer are
   * not children to the given element. Returns true if
   * they are.
   *
   * @param {HTMLElement} el - The element to check if it
   *     is a parent to the start and endContainer.
   * @returns {boolean}
   */
  this.ensureIsInside = function (el) {
    if (this.isInside(el)) {
      return true;
    }
    throw new Error('Range is not contained by given node.');
  };

  /**
   * Will swap start and end containers as well as offsets if
   * either the containers or the offsets are in the wrong
   * order (the start container / offset should precede the end)
   *
   * @returns {Type.Range} - This instance
   */
  this.ensureStartNodePrecedesEndNode = function () {

    var startIsEnd, startPrecedesEnd;
    startIsEnd = this.startContainer === this.endContainer;

    if (startIsEnd && this.startOffset <= this.endOffset) {
      return this;
    }

    if (startIsEnd && this.startOffset > this.endOffset) {
      return this._swapOffsets();
    }

    startPrecedesEnd = this.startContainer.compareDocumentPosition(this.endContainer);
    startPrecedesEnd = startPrecedesEnd & Node.DOCUMENT_POSITION_FOLLOWING;

    if (!startPrecedesEnd) {
      this._swapStartAndEnd();
    }

    return this;
  };

  /**
   * Will split the startContainer text node at the startOffset and set
   * this' startContainer to the right node the resulting nodes of the
   * split and the startOffset to 0. Will return the new startContainer.
   *
   * @returns {Node} - The new startContainer
   */
  this.splitStartContainer = function () {

    var startsAndEndsInSameNode;

    if (this.startOffset === 0) {
      return this.startContainer;
    }

    startsAndEndsInSameNode = this.startsAndEndsInSameNode();
    this.startContainer = this.startContainer.splitText(this.startOffset);

    if (startsAndEndsInSameNode) {
      this.endContainer = this.startContainer;
      this.endOffset -= this.startOffset;
    }

    this.startOffset = 0;

    return this.startContainer;
  };

  /**
   * Will split the endContainer text node at the endOffset and set
   * this' endContainer to the left node the resulting nodes of the
   * split and the endOffset to the end of the endContainer.
   * Will return the new endContainer.
   *
   * @returns {Node} - The new endContainer
   */
  this.splitEndContainer = function () {
    if (this.endOffset !== this.endContainer.length) {
      this.endContainer = this.endContainer.splitText(this.endOffset).previousSibling;
      this.endOffset = this.endContainer.length;
    }
    return this.endContainer;
  };

  /**
   * Creates a native {Range} object and returns it.
   * @returns {Range}
   */
  this.getNativeRange = function () {
    var range = document.createRange();
    range.setEnd(this.endContainer, this.endOffset);
    range.setStart(this.startContainer, this.startOffset);
    return range;
  };

  /**
   * Looks up the number of characters (offsets) where this range starts
   * and ends relative to a given {Element}. Returns an {Object} containing
   * the element itself and the offsets. This object can be used to restore
   * the range by using the {@link Type.Range.load} factory.
   *
   * @param {Element} fromNode
   * @returns {{from: Element, start: number, end: number}}
   */
  this.save = function (fromNode) {
    var start, end;
    start = this.getStartOffset(fromNode);
    end = this.startsAndEndsInSameNode() ? start - this.startOffset + this.endOffset : this.getEndOffset(fromNode);
    return { from: fromNode, start: start, end: end };
  };

  /**
   * Returns the length of this range as numbers of characters.
   * @returns {number}
   */
  this.getLength = function () {
    return Type.TextWalker.offset(this.startContainer, this.endContainer, this.startOffset, this.endOffset);
  };

  /**
   * Returns the offset (number of visible characters) from the given node
   * to the startContainer and its startOffset. If no node has been passed
   * this will return the startOffset
   *
   * @param {Node} [from] - The node to start counting characters from
   * @returns {number|null}
   */
  this.getStartOffset = function (from) {
    if (from) {
      return Type.TextWalker.offset(from, this.startContainer, 0, this.startOffset);
    }
    return parseInt(this.startOffset, 10);
  };

  /**
   * Returns the offset (number of visible characters) from the given node
   * to the endContainer and its endOffset. If no node has been passed
   * this will return the endOffset
   *
   * @param {Node} [from] - The node to start counting characters from
   * @returns {number|null}
   */
  this.getEndOffset = function (from) {
    if (from) {
      return Type.TextWalker.offset(from, this.endContainer, 0, this.endOffset);
    }
    return parseInt(this.endOffset, 10);
  };

  /**
   * Returns the element containing the startContainer.
   *
   * @returns {Node}
   */
  this.getStartElement = function () {
    return this.startContainer.parentNode;
  };

  /**
   * Returns the element containing the endContainer.
   *
   * @returns {Node}
   */
  this.getEndElement = function () {
    return this.endContainer.parentNode;
  };

  /**
   * Returns the tag name of the element containing the
   * startContainer.
   *
   * @returns {string}
   */
  this.getStartTagName = function () {
    return this.getStartElement().tagName.toLowerCase();
  };

  /**
   * Returns the tag name of the element containing the
   * endContainer.
   *
   * @returns {string}
   */
  this.getEndTagName = function () {
    return this.getEndElement().tagName.toLowerCase();
  };

  /**
   * Returns whether or not the the element containing the
   * startContainer is of the given tagName.
   *
   * @param {string} tagName - The tag name to compare.
   * @returns {boolean}
   */
  this.startTagIs = function (tagName) {
    return this.getStartTagName() === tagName.toLowerCase();
  };

  /**
   * Returns whether or not the the element containing the
   * endContainer is of the given tagName.
   *
   * @param {string} tagName - The tag name to compare.
   * @returns {boolean}
   */
  this.endTagIs = function (tagName) {
    return this.getEndTagName() === tagName.toLowerCase();
  };

  /**
   * Returns whether or not the startContainer equals the
   * endContainer.
   *
   * @returns {boolean}
   */
  this.startsAndEndsInSameNode = function () {
    return this.startContainer === this.endContainer;
  };

  /**
   * Returns whether or not this range spans over no characters
   * at all.
   *
   * @returns {boolean}
   */
  this.isCollapsed = function () {
    return this.startOffset === this.endOffset && this.startsAndEndsInSameNode();
  };

  /**
   * Internal method to swap the start and end containers as well
   * as their offsets when it is initialized with the endContainer
   * preceding the startContainer.
   *
   * @returns {Type.Range} - This instance
   * @private
   */
  this._swapStartAndEnd = function () {
    this._swapContainers();
    this._swapOffsets();
    return this;
  };

  /**
   * Will swap the startContainer with the endContainer
   *
   * @returns {Type.Range} - This instance
   * @private
   */
  this._swapContainers = function () {
    var swapContainer = this.startContainer;
    this.startContainer = this.endContainer;
    this.endContainer = swapContainer;
    return this;
  };

  /**
   * Will swap the startOffset with the endOffset
   *
   * @returns {Type.Range} - This instance
   * @private
   */
  this._swapOffsets = function () {
    var swapOffset = this.startOffset;
    this.startOffset = this.endOffset;
    this.endOffset = swapOffset;
    return this;
  };

}).call(Type.Range.prototype);


(function () {

  /**
   * The implementation of {Range#getClientRects} is broken in WebKit
   * browsers. {@link Type.Range._getClientRectsNeedsFix} tests for
   * wrong behaviour and stores if it is broken in this variable.
   *
   * @type {null|boolean}
   */
  Type.Range._getClientRectsIsBroken = null;

  /**
   * Will create a range spanning from the offset given as start to the
   * offset given as end, counting the characters contained by the given
   * el. This function should be used with the save method of {Type.Range}.
   *
   * @param {{from: HTMLElement, start: number, end: number}} bookmark -
   *     An object as returned by {Type.Range#save}
   * @param {HTMLElement} bookmark.from - The root element from which the
   *     start and end offsets should be counted
   * @param {number} bookmark.start - The offsets (number of characters)
   *     where the selection should start
   * @param {number} bookmark.end - The offsets (number of characters)
   *     where the selection should end
   * @returns {Type.Range} - A {Type.Range} instance
   */
  Type.Range.load = function (bookmark) {
    return Type.Range.fromPositions(bookmark.from, bookmark.start, bookmark.end);
  };

  /**
   * Will create a range spanning from the offset given as start to the
   * offset given as end, counting the characters contained by the given
   * el.
   *
   * @param {HTMLElement|Node} el - The root element from which the start
   *     and end offsets should be counted
   * @param {number} startOffset - The offsets (number of characters) where the
   *     selection should start
   * @param {number} endOffset - The offsets (number of characters) where the
   *     selection should end
   * @returns {Type.Range} - A {Type.Range} instance
   */
  Type.Range.fromPositions = function (el, startOffset, endOffset) {
    var start = Type.TextWalker.nodeAt(el, startOffset),
      end = Type.TextWalker.nodeAt(el, endOffset);
    return new Type.Range(start.node, start.offset, end.node, end.offset);
  };

  /**
   * Will read the current {Selection} on the document and create a {Type.Range}
   * spanning over the {Range}(s) contained by the selection. Will return
   * null if there is no selection on the document.
   *
   * todo Check if selection is actually inside editor and return null if not
   *
   * @returns {Type.Range|null} - A {Type.Range} instance or null
   */
  Type.Range.fromCurrentSelection = function () {
    var sel = document.getSelection();
    return sel.isCollapsed ? null : Type.Range.fromRange(sel.getRangeAt(0));
  };

  /**
   * Will create a {Type.Range} based on the start and end containers and
   * offsets of the given {Range}. This will also take care of browser
   * issues (especially WebKit) when the range is fetched from a selection
   * that ends at the end of an element.
   *
   * todo The "fix" is a solution for a single case
   * todo find the pattern of this and process all cases
   *
   * @param {Range} range - The {Range} that should be <em>migrated</em>
   *     to a {Type.Range}
   * @returns {Type.Range} - The {Type.Range} corresponding to the given
   *     {Range}
   */
  Type.Range.fromRange = function (range) {
    var endContainer = range.endContainer,
      endOffset = range.endOffset;
    if (endOffset === 0 && endContainer === Type.DomWalker.next(range.startContainer.parentNode.nextSibling, 'visible')) {
      endContainer = Type.DomWalker.last(range.startContainer.parentNode, 'text');
      endOffset = endContainer.length;
    }
    return new Type.Range(range.startContainer, range.startOffset, endContainer, endOffset);
  };

  /**
   * Will create a {Type.Range} spanning from the offset of the given {Caret}
   * over a number of characters passed as selectedChars. If selectedChars is
   * a positive number, the range's start will be set to the cursor position
   * and the end spanning to the characters to its right. If selectedChars is
   * negative it will span to the characters to its left.
   *
   * @param {Caret} caret
   * @param {number} selectedChars
   * @returns {Type.Range}
   */
  Type.Range.fromCaret = function (caret, selectedChars) {
    var startNode = caret.getNode(),
      startOffset = caret.getNodeOffset(),
      end = Type.TextWalker.nodeAt(startNode, selectedChars, startOffset);
    return new Type.Range(startNode, startOffset, end.node, end.offset);
  };

  /**
   * Will create a {Type.Range} containing the given element's text by
   * finding the first and last text nodes inside the element and spanning
   * a range beginning at the start of the first text node and at the end
   * of the last text node.
   *
   * @param {HTMLElement} el - The element that should be <em>covered</em>
   *     by the returned {Type.Range}.
   * @returns {Type.Range} - A {Type.Range} spanning over the contents of the
   *     given element.
   */
  Type.Range.fromElement = function (el) {
    var startNode = Type.DomWalker.first(el, 'text'),
      endNode = Type.DomWalker.last(el, 'text');
    return new Type.Range(startNode, 0, endNode, endNode.nodeValue.length);
  };

  /**
   * Will return a new {Type.Range} at the position read from a given
   * {MouseEvent}. Will return null if the event was not triggerd from
   * within a text node.
   *
   * @param {MouseEvent} e - The mouse event to read positions from
   * @returns {Type.Range|null} - Returns a new Type.Range or null if the
   *     event has not been triggered from inside a text node
   */
  Type.Range.fromMouseEvent = function (e) {
    return Type.Range.fromPoint(e.clientX, e.clientY);
  };

  /**
   * Will create a {Type.Range} at the offset and inside the text node
   * found at the x and y positions relative to the document. The range
   * will be collapsed. Will return null
   *
   * @param {number} x - The horizontal position relative to the document
   * @param {number} y - The vertical position relative to the document
   * @returns {Type.Range|null} - Returns a new Type.Range or null if the
   *     position is not inside a text node
   */
  Type.Range.fromPoint = function (x, y) {

    var range, node, offset;

    if (document.caretPositionFromPoint) {
      range = document.caretPositionFromPoint(x, y);
      node = range.offsetNode;
      offset = range.offset;

    } else if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(x, y);
      node = range.startContainer;
      offset = range.startOffset;

    } else {
      if (console.debug) {
        console.debug('This browser does not support caretPositionFromPoint or caretRangeFromPoint.');
      }
      return null;
    }

    // only split TEXT_NODEs
    if (node.nodeType === Node.TEXT_NODE) {
      return new Type.Range(node, offset, node, offset);
    }

    if (console.debug) {
      console.debug('User clicked in a non-text node, cannot create range');
    }

    return null;

  };

  /**
   * WebKit browsers sometimes create unnecessary and overlapping {ClientRect}s in
   * {Range.prototype.getClientRects}. This method creates 2 elements, creates a
   * range and tests for this behaviour.
   *
   * From {@link https://github.com/edg2s/rangefix}
   * (modified)
   *
   * Copyright (c) 2014 Ed Sanders under the
   * terms of The MIT License (MIT)
   *
   * @returns {boolean}
   * @private
   */
  Type.Range._testGetClientRectsNeedsFix = function () {

    var range = document.createRange(),
      p1 = Type.DomUtilities.addElement('p'),
      p2 = Type.DomUtilities.addElement('p'),
      needsFix;

    p1.appendChild(document.createTextNode('aa'));
    p2.appendChild(document.createTextNode('aa'));

    range.setStart(p1.firstChild, 1);
    range.setEnd(p2.firstChild, 1);

    needsFix = range.getClientRects().length > 2;

    Type.DomUtilities.removeElement(p1);
    Type.DomUtilities.removeElement(p2);

    return needsFix;

  };

  /**
   * Will return if the browser has a broken model for {Range.prototype.getClientRects}.
   * This is usually the case with WebKit.
   *
   * @returns {boolean}
   * @private
   */
  Type.Range._getClientRectsNeedsFix = function () {
    if (typeof Type.Range._getClientRectsIsBroken !== 'boolean') {
      Type.Range._getClientRectsIsBroken = this._testGetClientRectsNeedsFix();
    }
    return Type.Range._getClientRectsIsBroken;
  };

  /**
   * WebKit browsers sometimes create unnecessary and overlapping {ClientRect}s
   * in {Range.prototype.getClientRects}. This method takes a {Range}, fixes
   * the {ClientRect}s (if necessary) and returns them.
   *
   * From {@link https://github.com/edg2s/rangefix}
   * (modified)
   *
   * Copyright (c) 2014 Ed Sanders under the
   * terms of The MIT License (MIT)
   *
   * @param {Range} range - A native {Range}
   * @return {ClientRect[]} ClientRectList or list of
   *     ClientRect objects describing range
   */
  Type.Range.getClientRects = function (range) {

    if (!Type.Range._getClientRectsNeedsFix()) {
      return range.getClientRects();
    }

    var partialRange = document.createRange(),
      endContainer = range.endContainer,
      endOffset = range.endOffset,
      rects = [];

    while (endContainer !== range.commonAncestorContainer) {

      partialRange.setStart(endContainer, 0);
      partialRange.setEnd(endContainer, endOffset);

      Array.prototype.push.apply(rects, partialRange.getClientRects());

      endOffset = Array.prototype.indexOf.call( endContainer.parentNode.childNodes, endContainer );
      endContainer = endContainer.parentNode;

    }

    partialRange = range.cloneRange();
    partialRange.setEnd(endContainer, endOffset);
    Array.prototype.push.apply(rects, partialRange.getClientRects());

    return rects;

  };

}).call();

module.exports = Type.Range;
