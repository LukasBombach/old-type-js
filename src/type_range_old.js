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
   * @param tagName
   * @returns {boolean}
   */
  spansToElement : function (tagName) {
    return this.isEnclosedByElement(tagName) &&
      this.startOffset === 0 &&
      this.endOffset === this.endContainer.length &&
      this.startContainer === this.startContainer.parentNode.firstChild &&
      this.endContainer === this.startContainer.parentNode.lastChild;
  },

  /**
   *
   * @param tagName
   * @returns {boolean}
   */
  isEnclosedByElement : function (tagName) {
    var startElement = this.getStartElement();
    return startElement.tagName.toLowerCase() === tagName.toLowerCase() &&
        startElement === this.getEndElement();
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