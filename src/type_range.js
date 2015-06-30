'use strict';

var DomUtil = require('./dom_utilities');

/**
 *
 * @param {Node} startContainer
 * @param {Number} startOffset
 * @param {Node} endContainer
 * @param {Number} endOffset
 * @constructor
 */
function TypeRange(startContainer, startOffset, endContainer, endOffset) {

  this.startContainer = startContainer;
  this.startOffset    = startOffset;
  this.endContainer   = endContainer;
  this.endOffset      = endOffset;

  this.ensureStartNodePrecedesEndNode();

}

/**
 *
 * @type {null|boolean}
 */
TypeRange._getClientRectsNeedsFix = null;

(function () {

  /**
   *
   * @returns {Node}
   */
  this.getStartElement = function () {
    return this.startContainer.parentNode;
  };

  /**
   *
   * @returns {Node}
   */
  this.getEndElement = function () {
    return this.endContainer.parentNode;
  };

  /**
   *
   * @returns {string}
   */
  this.getStartTagName = function () {
    return this.getStartElement().tagName.toLowerCase();
  };

  /**
   *
   * @returns {string}
   */
  this.getEndTagName = function () {
    return this.getEndElement().tagName.toLowerCase();
  };

  /**
   *
   * @param tagName
   * @returns {boolean}
   */
  this.startTagIs = function (tagName) {
    return this.getStartTagName() === tagName.toLowerCase();
  };

  /**
   *
   * @param tagName
   * @returns {boolean}
   */
  this.endTagIs = function (tagName) {
    return this.getEndTagName() === tagName.toLowerCase();
  };

  /**
   *
   * @returns {boolean}
   */
  this.startsAndEndsInSameNode = function () {
    return this.startContainer === this.endContainer;
  };

  /**
   *
   * @returns {boolean}
   */
  this.isCollapsed = function () {
    return this.startOffset === this.endOffset && this.startsAndEndsInSameNode();
  };

  /**
   *
   * @param {String} tag - A tag name
   * @param {Node} [constrainingNode]
   * @returns {Node|null}
   */
  this.startAndEndEnclosedBySame = function (tag, constrainingNode) {
    var tagEnclosingStartNode = DomUtil.parent(this.startContainer, tag, constrainingNode);
    if (tagEnclosingStartNode !== null) {
      if (tagEnclosingStartNode === DomUtil.parent(this.endContainer, tag, constrainingNode)) {
        return tagEnclosingStartNode;
      }
    }
    return null;
  };

  /**
   *
   * @param {Node} node
   * @returns {boolean}
   */
  this.isInside = function (node) {
    return node.contains(this.startContainer) && node.contains(this.endContainer);
  };

  /**
   *
   * @param node
   * @returns {boolean}
   */
  this.ensureIsInside = function (node) {
    if (this.isInside(node)) {
      return true;
    }
    throw new Error('Range is not contained by given node.');
  };

  /**
   *
   * @returns {boolean}
   */
  this.ensureStartNodePrecedesEndNode = function () {
    var isSameNode = this.startContainer === this.endContainer,
      startPrecedesEnd = this.startContainer.compareDocumentPosition(this.endContainer) & Node.DOCUMENT_POSITION_FOLLOWING;
    if (isSameNode || startPrecedesEnd) {
      return true;
    }
    throw new Error('Given startContainer does not precede endContainer.');
  };

  /**
   *
   * @returns {Node}
   */
  this.splitStartContainer = function () {
    if (this.startOffset !== 0) {
      var startsAndEndsInSameNode = this.startsAndEndsInSameNode();
      this.startContainer = this.startContainer.splitText(this.startOffset);
      if(startsAndEndsInSameNode) {
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

}).call(TypeRange.prototype);


(function () {

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
   * Will return if the browser has a broken model for {Range.prototype.getClientRects}.
   * This is usually the case with WebKit.
   *
   * @returns {boolean}
   * @private
   */
  TypeRange._getClientRectsNeedsFix = function () {
    if (typeof TypeRange._getClientRectsNeedsFix !== 'boolean') {
      TypeRange._getClientRectsNeedsFix = this._testGetClientRectsNeedsFix();
    }
    return TypeRange._getClientRectsNeedsFix;
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
