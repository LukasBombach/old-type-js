'use strict';

var Type = require('./core');

Type.Contents = function () {
};

(function () {

  /**
   *
   * @param textNode
   * @param offset
   * @param str
   * @returns {Type.Contents}
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
   * todo refactor var names "a" and "b"
   * todo distinguish block from inline tags
   *
   * TODO CONSTRAIN TO TYPE ROOT !!! !  !   !!!
   *
   * remove(range)
   * remove(caret, -1)
   *
   * @param {Type.Range|Caret} range
   * @param {number} [numChars]
   */
  this.remove = function (range, numChars) {

    var startNode, endNode, startParent, current, prev, startRemoved, currentParent, a, b;

    if (arguments.length === 2) {
      range = Type.Range.fromCaret(range, numChars);
    }

    startNode = range.splitStartContainer();
    endNode = range.splitEndContainer();
    startParent = startNode.parentNode;
    current = endNode;
    prev = endNode;
    startRemoved = false;

    while (!startRemoved) {

      prev = Type.DomWalker.prev(current, 'text');

      a = (current === endNode && range.endOffset === 0);
      b = (current !== startNode && current === Type.DomWalker.first(current.parentNode, 'text'));

      if (a || b) {
        currentParent = current.parentNode;
        Type.DomUtilities.moveAfter(prev, current.parentNode.childNodes);
        Type.DomUtilities.removeVisible(currentParent);
      }

      startRemoved = current === startNode;
      Type.DomUtilities.removeVisible(current);
      current = prev;

    }

    startParent.normalize();

    return this;

  };

  /**
   *
   * @param {number} steps
   * @returns {Type.Contents}
   */
  this.undo = function (steps) {
    steps = steps === null ? 1 : steps;
    return this;
  };

  /**
   *
   * @param {number} steps
   * @returns {Type.Contents}
   */
  this.redo = function (steps) {
    steps = steps === null ? 1 : steps;
    return this;
  };

  /**
   *
   * @param {string} changeset
   * @returns {Type.Contents}
   */
  this.applyChangeset = function (changeset) {
    return this;
  };

  /**
   *
   * @param {string} changeset
   * @returns {Type.Contents}
   */
  this.removeChangeset = function (changeset) {
    this.applyChangeset(this._invertChangeset(changeset));
    return this;
  };

  /**
   *
   * @param {string} changeset
   * @returns {Type.Contents}
   * @private
   */
  this._invertChangeset = function (changeset) {

  };

}).call(Type.Contents.prototype);

module.exports = Type.Contents;
