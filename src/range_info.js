'use strict';

/**
 *
 * @param {Range} range
 * @returns {*}
 * @constructor
 */
function RangeInfo(range) {
  // Todo duck typing of range (must have the following properties)
  this.startContainer = range.startContainer;
  this.endContainer = range.endContainer;
  this.startOffset = range.startOffset;
  this.endOffset = range.endOffset;
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
