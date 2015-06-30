'use strict';

var DomUtil = require('./dom_utilities');

/**
 * {TypeRange} is a shim for the browsers' native {Range} objects and
 * is being used in Type for anything related to text ranges.
 *
 * Native ranges are often buggy, lack essential features and should
 * not be used other than for performance reasons. This class avoids
 * and / or fixes common issues with ranges and adds many methods
 * useful for text editing.
 *
 * Among many other factory methods, you can use the {TypeRange.fromRange}
 * method to create a {TypeRange} from a native {Range}.
 *
 * @param {Node} startContainer - A text node that the range should start in.
 * @param {number} startOffset - The offset (of characters) inside the
 *     startContainer where the range should begin.
 * @param {Node} endContainer - A text node that the range should end in.
 * @param {number} endOffset - The offset (of characters) inside the
 *     endContainer where the range should stop.
 * @constructor
 */
function TypeRange(startContainer, startOffset, endContainer, endOffset) {

  this.startContainer = startContainer;
  this.startOffset    = startOffset;
  this.endContainer   = endContainer;
  this.endOffset      = endOffset;

  this.ensureStartNodePrecedesEndNode();

}

(function () {

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
   * If the startContainer and the endContainer are enclosed by
   * the same element matching the selector, that element will
   * be returned. Otherwise null will be returned.
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

    var tagEnclosingStartNode = DomUtil.parent(this.startContainer, selector, constrainingNode),
      tagEnclosingEndNode;

    if (tagEnclosingStartNode === null) {
      return null;
    }

    tagEnclosingEndNode = DomUtil.parent(this.endContainer, selector, constrainingNode);

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
   * @param {HTMLElement} el - The element to check if it
   *     is a parent to the start and endContainer.
   * @returns {boolean}
   */
  this.isInside = function (el) {
    return el.contains(this.startContainer) && el.contains(this.endContainer);
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
   * @returns {TypeRange} - This instance
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
    startPrecedesEnd = startPrecedesEnd  & Node.DOCUMENT_POSITION_FOLLOWING;

    if (startPrecedesEnd) {
      this._swapStartAndEnd();
    }

    return this;
  };

  /**
   *
   * @returns {Node}
   */
  this.splitStartContainer = function () {
    if (this.startOffset !== 0) {
      var startsAndEndsInSameNode = this.startsAndEndsInSameNode();
      this.startContainer = this.startContainer.splitText(this.startOffset);
      if (startsAndEndsInSameNode) {
        this.endContainer = this.startContainer;
        this.endOffset -= this.startOffset;
      }
      this.startOffset = 0;
    }
    return this.startContainer;
  };

  /**
   *
   * @returns {*|Node}
   */
  this.splitEndContainer = function () {
    if (this.endOffset !== this.endContainer.length) {
      this.endContainer = this.endContainer.splitText(this.endOffset).previousSibling;
      this.endOffset = this.endContainer.length;
    }
    return this.endContainer;
  };

  /**
   *
   * @returns {TypeRange}
   */
  this.select = function () {
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(this.getRange());
    return this;
  };

  /**
   *
   * @returns {TextRange|Range}
   */
  this.getRange = function () {
    var range = document.createRange();
    range.setEnd(this.endContainer, this.endOffset);
    range.setStart(this.startContainer, this.startOffset);
    return range;
  };

  /**
   * todo use this wherever I use range methods for this, namely selection and selection overlay
   * todo caching
   */
  this.getPositions = function () {
    //this.getRange().getClientRects()
  };


  this.getRects = function () {
    TypeRange.getClientRects(this.getNativeRange);
  };

  /**
   *
   * @param {HTMLElement} fromNode
   * @returns {{from: HTMLElement, start: number, end: number}}
   */
  this.save = function (fromNode) {
    var start, end;
    start = this._offsetFromNodeToNode(fromNode, this.startContainer, this.startOffset);
    if (this.startsAndEndsInSameNode()) {
      end = start - this.startOffset + this.endOffset;
    } else {
      end = this._offsetFromNodeToNode(fromNode, this.endContainer, this.endOffset);
    }
    return { from: fromNode, start: start, end: end }
  };

  /**
   * Todo cross-browser compatibility: http://stackoverflow.com/a/4812022/1183252
   *
   * @param {HTMLElement} containingNode
   * @param {Node} searchNode
   * @param {number} searchOffset
   * @returns {number}
   * @private
   */
  this._offsetFromNodeToNode = function (containingNode, searchNode, searchOffset) {
    var node = containingNode, offsetWalked = 0;
    while (node = DomUtil.nextTextNode(node)) {
      if (node === searchNode) return offsetWalked + searchOffset;
      offsetWalked += node.nodeValue.length;
    }
    return null;
  };

  this._swapStartAndEnd = function () {
    this._swapContainers();
    this._swapOffsets();
    return this;
  };

  this._swapContainers = function () {
    var swapContainer = this.startContainer;
    this.startContainer = this.endContainer;
    this.endContainer = swapContainer;
    return this;
  };

  /**
   *
   * @returns {*}
   * @private
   */
  this._swapOffsets = function () {
    var swapOffset = this.startOffset;
    this.startOffset = this.endOffset;
    this.endOffset = swapOffset;
    return this;
  };

}).call(TypeRange.prototype);


(function () {

  /**
   *
   * @type {null|boolean}
   */
  TypeRange._getClientRectsIsBroken = null;

  /**
   * Will create a range spanning from the offset given as start to the
   * offset given as end, counting the characters contained by the given
   * el. This function should be used with the save method of {TypeRange}.
   *
   * @param {{from: HTMLElement, start: number, end: number}} bookmark -
   *     An object as returned by {TypeRange.save}
   * @param {HTMLElement} bookmark.from - The root element from which the
   *     start and end offsets should be counted
   * @param {number} bookmark.start - The offsets (number of characters)
   *     where the selection should start
   * @param {number} bookmark.end - The offsets (number of characters)
   *     where the selection should end
   * @returns {TypeRange} - A {TypeRange} instance
   */
  TypeRange.load = function (bookmark) {
    return TypeRange.fromPositions(bookmark.from, bookmark.start, bookmark.end);
  };

  /**
   * Will create a range spanning from the offset given as start to the
   * offset given as end, counting the characters contained by the given
   * el.
   *
   * @param {HTMLElement|Node} el - The root element from which the start
   *     and end offsets should be counted
   * @param {number} start - The offsets (number of characters) where the
   *     selection should start
   * @param {number} end - The offsets (number of characters) where the
   *     selection should end
   * @returns {TypeRange} - A {TypeRange} instance
   */
  TypeRange.fromPositions = function (el, start, end) {
    var startInfo, endInfo;
    startInfo = TypeRange._nodeFromOffset(el, start);
    endInfo = TypeRange._nodeFromOffset(el, end);
    return new TypeRange(startInfo.node, startInfo.offset, endInfo.node, endInfo.offset);
  };

  /**
   * Will read the current {Selection} on the document and create a {TypeRange}
   * spanning over the {Range}(s) contained by the selection. Will return
   * null if there is no selection on the document.
   * todo Check if selection is actually inside editor and return null if not
   *
   * @returns {TypeRange|null} - A {TypeRange} instance or null
   */
  TypeRange.fromCurrentSelection = function () {
    var sel = document.getSelection();
    return sel.isCollapsed ? null : TypeRange.fromRange(sel.getRangeAt(0));
  };

  /**
   * Will create a {TypeRange} based on the start and end containers and
   * offsets of the given {Range}. This will also take care of browser
   * issues (especially WebKit) when the range is fetched from a selection
   * that ends at the end of an element.
   * todo The "fix" is a solution for a single case
   * todo find the pattern of this and process all cases
   *
   * @param {Range} range - The {Range} that should be <em>migrated</em>
   *     to a {TypeRange}
   * @returns {TypeRange} - The {TypeRange} corresponding to the given
   *     {Range}
   */
  TypeRange.fromRange = function (range) {
    var endContainer = range.endContainer,
      endOffset = range.endOffset;
    if (endOffset === 0 && endContainer === DomUtil.nextVisible(range.startContainer.parentNode.nextSibling)) {
      endContainer = DomUtil.lastTextNode(range.startContainer.parentNode);
      endOffset = endContainer.length;
    }
    return new TypeRange(range.startContainer, range.startOffset, endContainer, endOffset);
  };

  /**
   * Will create a {TypeRange} containing the given element's text by
   * finding the first and last text nodes inside the element and spanning
   * a range beginning at the start of the first text node and at the end
   * of the last text node.
   *
   * @param {HTMLElement} el - The element that should be <em>covered</em>
   *     by the returned {TypeRange}.
   * @returns {TypeRange} - A {TypeRange} spanning over the contents of the
   *     given element.
   */
  TypeRange.fromElement = function (el) {
    var startNode = DomUtil.firstTextNode(el),
      endNode = DomUtil.lastTextNode(el);
    return new TypeRange(startNode, 0, endNode, endNode.nodeValue.length);
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
  TypeRange._testGetClientRectsNeedsFix = function () {

    var range = document.createRange(),
      p1 = DomUtil.addElement('p'),
      p2 = DomUtil.addElement('p'),
      needsFix;

    p1.appendChild(document.createTextNode('aa'));
    p2.appendChild(document.createTextNode('aa'));

    range.setStart(p1.firstChild, 1);
    range.setEnd(p2.firstChild, 1);

    needsFix = range.getClientRects().length > 2;

    DomUtil.removeElement(p1);
    DomUtil.removeElement(p2);

    return needsFix;

  };

  /**
   * Will return if the browser has a broken model for {Range.prototype.getClientRects}.
   * This is usually the case with WebKit.
   *
   * @returns {boolean}
   * @private
   */
  TypeRange._getClientRectsNeedsFix = function () {
    if (typeof TypeRange._getClientRectsIsBroken !== 'boolean') {
      TypeRange._getClientRectsIsBroken = this._testGetClientRectsNeedsFix();
    }
    return TypeRange._getClientRectsIsBroken;
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
  TypeRange.getClientRects = function (range) {

    if (!TypeRange._getClientRectsNeedsFix()) {
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

  /**
   * Will walk through and count all visible characters in the given
   * containingNode and return the text node where the offset ends in.
   * The method will also return the remaining offset inside that text
   * node.
   *
   * @param {Element} containingElement - The element of which the text
   *     should be walked through
   * @param {number} offset - The offset of the character of the text
   *     contained by the given element
   * @returns {{node: Node, offset: number}|null} - The text node and
   *     offset in which the given offset ends
   * @private
   */
  TypeRange._nodeFromOffset = function (containingElement, offset) {
    var node = containingElement, offsetWalked = 0, length;
    while (node = DomUtil.nextTextNode(node)) {
      length = node.nodeValue.length;
      if (offsetWalked + length >= offset) {
        return { node: node, offset: offset-offsetWalked };
      }
      offsetWalked += length;
    }
    return null;
  };

}).call();

module.exports = TypeRange;
