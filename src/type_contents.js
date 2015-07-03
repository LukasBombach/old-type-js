'use strict';

var DomUtil = require('./dom_utilities');

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
        textNode.nodeValue = nodeText.substring(0, offset) + str + nodeText.substring(offset, nodeText.length);
      } else {
        textNode.nodeValue = str + nodeText;
      }

    }

    return this;

  };

  /**
   * Removes one character left from the current offset
   * and moves the caret accordingly
   *
   * @param textNode
   * @param offset
   * @param {number} [numChars] - Home many characters should be removed
   *     from the caret's position. A negative number will remove
   *     characters left from the caret, a positive number from the right.
   * @returns {Caret}
   */
  this.remove = function (textNode, offset, numChars) {

    var parent, prev, str;

    numChars = numChars || -1;

    if (offset === 0 && numChars === textNode.nodeValue.length) {
      DomUtil.removeVisible(textNode);
      return this;
    }

    if (offset === 0 && numChars > textNode.nodeValue.length) {
      numChars -= textNode.nodeValue.length;
      parent = DomUtil.removeVisible(textNode);
      this._remove(DomUtil.nextTextNode(parent), 0, numChars);
      return this;
    }

    if (offset === textNode.nodeValue.length && numChars * -1 === textNode.nodeValue.length) {
      DomUtil.removeVisible(textNode);
      return this;
    }

    if (offset === textNode.nodeValue.length && numChars * -1 > textNode.nodeValue.length) {
      numChars += textNode.nodeValue.length;
      parent = DomUtil.removeVisible(textNode);
      prev = DomUtil.prevTextNode(parent, this._type.root);
      this._remove(prev, prev.nodeValue.length, numChars);
      return this;
    }

    str = textNode.nodeValue;

    if (numChars < 0) {
      textNode.nodeValue = str.substring(0, offset + numChars) + str.substring(offset, str.length);
    } else {
      textNode.nodeValue = str.substring(0, offset) + str.substring(offset + numChars, str.length);
    }

    return this;

  };

  /**
   *
   * @param {TypeRange} range
   */
  this.removeRange = function (range) {

    var startNode = range.splitStartContainer(),
      endNode = range.splitEndContainer(),
      startParent = startNode.parentNode,
      current = endNode,
      prev = endNode,
      startRemoved = false,
      currentParent;

    while (!startRemoved) {

      prev = DomUtil.prevTextNode(current);

      if (current !== startNode && current === DomUtil.firstTextNode(current.parentNode)) {
        currentParent = current.parentNode;
        DomUtil.moveAfter(prev, current.parentNode.childNodes);
        DomUtil.removeVisible(currentParent);
      }

      startRemoved = current === startNode;
      DomUtil.removeVisible(current);
      current = prev;

    }

    startParent.normalize();

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
