'use strict';

function TypeContents() {
}


(function () {

  /**
   *
   * @param textNode
   * @param offset
   * @param str
   * @returns {TypeContents}
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
   * @returns {TypeContents}
   */
  this.remove = function (textNode, offset, numChars) {

    return this;
  };

  /**
   *
   * @param {number} steps
   * @returns {TypeContents}
   */
  this.undo = function (steps) {
    steps = steps === null ? 1 : steps;
    return this;
  };

  /**
   *
   * @param {number} steps
   * @returns {TypeContents}
   */
  this.redo = function (steps) {
    steps = steps === null ? 1 : steps;
    return this;
  };

  /**
   *
   * @param {string} changeset
   * @returns {TypeContents}
   */
  this.applyChangeset = function (changeset) {
    return this;
  };

  /**
   *
   * @param {string} changeset
   * @returns {TypeContents}
   */
  this.removeChangeset = function (changeset) {
    this.applyChangeset(this._invertChangeset(changeset));
    return this;
  };

  /**
   *
   * @param {string} changeset
   * @returns {TypeContents}
   * @private
   */
  this._invertChangeset = function (changeset) {

  };

}).call(TypeContents.prototype);

module.exports = TypeContents;
