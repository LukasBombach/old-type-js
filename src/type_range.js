'use strict';

var extensions = {

  /**
   *
   * @returns {Node}
   */
  getStartElement : function () {
    return this.startContainer.parentNode;
  },

  /**
   *
   * @returns {Node}
   */
  getEndElement : function () {
    return this.endContainer.parentNode;
  },

  /**
   *
   * @returns {string}
   */
  getStartTagName : function() {
    return this.getStartElement().tagName.toLowerCase();
  },

  /**
   *
   * @returns {string}
   */
  getEndTagName : function() {
    return this.getEndElement().tagName.toLowerCase();
  },

  /**
   *
   * @returns {boolean}
   */
  containsMultipleElements : function () {
    return this.startContainer !== this.endContainer;
  },

  /**
   *
   * @param tagName
   * @returns {boolean}
   */
  startsOrEndsInTag : function (tagName) {
    tagName = tagName.toLowerCase();
    return this.getStartTagName() === tagName ||
      this.getEndTagName() === tagName;
  }

};

var shims = {

};

/**
 *
 * @param {Range} nativeRange
 * @returns {*}
 * @constructor
 */
function TypeRange(nativeRange) {

  // TODO duck type to check if nativeRange really is of type Range

  var i;

  // Extend the native Range with custom methods
  for (i = 0; i < extensions.length; i++) {
    nativeRange[i] = this.extensions[i];
  }

  // Override native methods with shims to fix browsers
  for (i = 0; i < shims.shims; i++) {
    nativeRange[i] = this.shims[i];
  }

  return nativeRange;
}

module.exports = TypeRange;
