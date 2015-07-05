'use strict';

var DomUtil = require('./dom_utilities');
var Walker = require('./dom_walker');
var TypeRange = require('./type_range');

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
   * todo refactor var names "a" and "b"
   * todo distinguish block from inline tags
   *
   * remove(range)
   * remove(caret, -1)
   *
   * @param {TypeRange|Caret} range
   * @param {number} [numChars]
   */
  this.remove = function (range, numChars) {

    var startNode, endNode, startParent, current, prev, startRemoved, currentParent, a, b;

    if (arguments.length === 2) {
      range = TypeRange.fromCaret(range, numChars);
    }

    startNode = range.splitStartContainer();
    endNode = range.splitEndContainer();
    startParent = startNode.parentNode;
    current = endNode;
    prev = endNode;
    startRemoved = false;

    while (!startRemoved) {

      prev = Walker.prev(current, 'text');

      a = (current === endNode && range.endOffset === 0);
      b = (current !== startNode && current === Walker.first(current.parentNode, 'text'));

      if (a || b) {
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
