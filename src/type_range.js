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
function TypeRange (startContainer, startOffset, endContainer, endOffset) {

  this.startContainer = startContainer;
  this.startOffset    = startOffset;
  this.endContainer   = endContainer;
  this.endOffset      = endOffset;

  this.ensureStartNodePrecedesEndNode();

}

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
    if (tagEnclosingStartNode !== null && tagEnclosingStartNode === DomUtil.parent(this.endContainer, tag, constrainingNode))
      return tagEnclosingStartNode;
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
    if (this.isInside(node)) return true;
    throw new Error('Range is not contained by given node.');
  };

  /**
   *
   * @returns {boolean}
   */
  this.ensureStartNodePrecedesEndNode = function () {
    var isSameNode = this.startContainer === this.endContainer,
      startPrecedesEnd = this.startContainer.compareDocumentPosition(this.endContainer) & Node.DOCUMENT_POSITION_FOLLOWING;
    if (isSameNode || startPrecedesEnd) return true;
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
   *
   * @param {HTMLElement} fromNode
   * @returns {{from: HTMLElement, start: number, end: number}}
   */
  this.positions = function (fromNode) {

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

/**
 *
 * @param {HTMLElement|Node|{from: HTMLElement, start: number, end: number}} positions
 * @param {number} [start]
 * @param {number} [end]
 * @returns {TypeRange}
 */
TypeRange.fromPositions = function (positions, start, end) {

  var startInfo, endInfo;

  if (positions.nodeType) {
    positions = {from: positions, start: start, end: end}
  }

  startInfo = TypeRange._nodeFromOffset(positions.from, positions.start);
  endInfo = TypeRange._nodeFromOffset(positions.from, positions.end);

  return new TypeRange(startInfo.node, startInfo.offset, endInfo.node, endInfo.offset);

};

/**
 *
 * @returns {TypeRange}
 */
TypeRange.fromCurrentSelection = function () {
  return TypeRange.fromRange(document.getSelection().getRangeAt(0));
};

/**
 *
 * @param {Range} range
 * @returns {TypeRange}
 */
TypeRange.fromRange = function (range) {

  var endContainer = range.endContainer,
    endOffset = range.endOffset;

  // Todo This is a solution for a single case, find the pattern of this and process all cases
  if (endOffset === 0 && endContainer === DomUtil.nextVisible(range.startContainer.parentNode.nextSibling)) {
    endContainer = DomUtil.lastTextNode(range.startContainer.parentNode);
    endOffset = endContainer.length;
  }

  return new TypeRange(range.startContainer, range.startOffset, endContainer, endOffset);
};

/**
 *
 * @param {HTMLElement} el
 * @returns {TypeRange}
 */
TypeRange.fromElement = function (el) {
  var startNode = DomUtil.firstTextNode(el),
    endNode = DomUtil.lastTextNode(el);
  return new TypeRange(startNode, 0, endNode, endNode.nodeValue.length);
};

/**
 *
 * @param containingNode
 * @param offset
 * @returns {{node: Node, offset: number}|null}
 * @private
 */
TypeRange._nodeFromOffset = function (containingNode, offset) {

  var node = containingNode, offsetWalked = 0, length;

  while (node = DomUtil.nextTextNode(node)) {
    length = node.nodeValue.length;
    if (offsetWalked + length >= offset) return { node: node, offset: offset-offsetWalked };
    offsetWalked += length;
  }

  return null;

};

module.exports = TypeRange;
