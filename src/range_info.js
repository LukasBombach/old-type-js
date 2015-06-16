'use strict';

/**
 *
 * @param {Range|Node} rangeOrStartContainer
 * @param {Number} startOffset
 * @param {Node} endContainer
 * @param {Number} endOffset
 * @constructor
 */
function RangeInfo(rangeOrStartContainer, startOffset, endContainer, endOffset) {

  // If 1 param has been passed, param should be a Range object
  if (arguments.length === 1) {
    this.startContainer = rangeOrStartContainer.startContainer;
    this.startOffset    = rangeOrStartContainer.startOffset;
    this.endContainer   = rangeOrStartContainer.endContainer;
    this.endOffset      = rangeOrStartContainer.endOffset;

  // If 4 params have been passed, all data is given individually
  } else if (arguments.length === 4) {
    this.startContainer = rangeOrStartContainer;
    this.startOffset    = startOffset;
    this.endContainer   = endContainer;
    this.endOffset      = endOffset;

  // In case of wrong usage
  } else {
    throw new Error('Illegal parameters. Pass either a Range or descriptive parameters. You passed', arguments);
  }

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
  this.containsMultipleElements = function () {
    return this.startContainer !== this.endContainer;
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
    throw new Error('Range is not inside given node.');
  };

  /**
   *
   * @returns {boolean}
   */
  this.ensureStartNodePrecedesEndNode = function () {
    var isSameNode     = this.startContainer === this.endContainer,
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
      this.startContainer = this.startContainer.splitText(this.startOffset);
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

}).call(RangeInfo.prototype);


module.exports = RangeInfo;
