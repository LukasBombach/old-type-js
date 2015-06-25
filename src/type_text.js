'use strict';

function TypeText() {
}


(function () {

  /**
   *
   * @param textNode
   * @param offset
   * @param str
   * @returns {TypeText}
   */
  this.insertText = function (textNode, offset, str) {

    var newNode, nodeText;

    if (/^[\n\r]+$/.test(str)) {

      newNode = textNode.splitText(offset);
      newNode.parentNode.insertBefore(document.createElement('br'), newNode);
      this.moveTo(newNode, 0);

    } else {

      nodeText = textNode.nodeValue;
      if (offset > 0) {
        textNode.nodeValue = nodeText.substring(0, offset)
          + str
          + nodeText.substring(offset, nodeText.length);
      } else {
        textNode.nodeValue = str + nodeText;
      }
      this._setOffset(offset + str.length);

    }

    return this;

  };

  /**
   *
   * @param textNode
   * @param offset
   * @param numChars
   * @returns {TypeText}
   */
  this.remove = function (textNode, offset, numChars) {

    return this;
  };

  /**
   *
   * @param {number} steps
   * @returns {TypeText}
   */
  this.undo = function (steps) {
    steps = steps === null ? 1 : steps;
    return this;
  };

  /**
   *
   * @param {number} steps
   * @returns {TypeText}
   */
  this.redo = function (steps) {
    steps = steps === null ? 1 : steps;
    return this;
  };

  /**
   *
   * @param {string} changeset
   * @returns {TypeText}
   */
  this.applyChangeset = function (changeset) {
    return this;
  };

  /**
   *
   * @param {string} changeset
   * @returns {TypeText}
   */
  this.removeChangeset = function (changeset) {
    this.applyChangeset(this._invertChangeset(changeset));
    return this;
  };

  /**
   *
   * @param {string} changeset
   * @returns {TypeText}
   * @private
   */
  this._invertChangeset = function (changeset) {

  };

}).call(TypeText.protoype);

module.exports = TypeText;
