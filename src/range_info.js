'use strict';

/**
 *
 * @param {Range|Node} rangeOrStartContainer
 * @returns {*}
 * @constructor
 */
function RangeInfo(rangeOrStartContainer, startOffset, endContainer, endOffset) {

  // If first param is a Range object, read data from it
  if (rangeOrStartContainer.startContainer && rangeOrStartContainer.endContainer) {
    this.startContainer = rangeOrStartContainer.startContainer;
    this.startOffset = rangeOrStartContainer.startOffset;
    this.endContainer = rangeOrStartContainer.endContainer;
    this.endOffset = rangeOrStartContainer.endOffset;

  // If 4 params have been passed
  } else if (rangeOrStartContainer.nodeType === 3 && arguments.length === 4) {
    this.startContainer = rangeOrStartContainer;
    this.startOffset = startOffset;
    this.endContainer = endContainer;
    this.endOffset = endOffset;

  // In case of wrong usage
  } else {
    throw new Error('Illegal parameters. Pass either a Range or descriptive parameters. You passed', arguments);
  }

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
  this.containsMultipleElements = function () {
    return this.startContainer !== this.endContainer;
  };

  //this.isEnclosedByTag = function () {
  //
  //};

  //startsOrEndsInTag : function (tagName) {
  //  tagName = tagName.toLowerCase();
  //  return this.getStartTagName() === tagName ||
  //    this.getEndTagName() === tagName;
  //}

}).call(RangeInfo.prototype);


module.exports = RangeInfo;
