'use strict';

var Type = require('./core');

/**
 *
 * @param {Type} type
 * @constructor
 */
Type.Contents = function (type) {
  this._type = type;
  this._root = type.getRoot();
};

(function () {

  /**
   * Inserts a string in a text node at a given offset
   *
   * @param {Text} textNode - The text node into which str will be inserted.
   * @param {Number} offset - The character offset at which str will be inserted.
   * @param {String} str - The text that will be inserted
   * @returns {Type.Contents} - This instance
   */
  this.insertText = function (textNode, offset, str) {

    var nodeText = textNode.nodeValue;

    if (offset > 0) {
      textNode.nodeValue = nodeText.substring(0, offset) + str + nodeText.substring(offset, nodeText.length);
    } else {
      textNode.nodeValue = str + nodeText;
    }

    return this;
  };

  /**
   * Inserts DOM nodes at the offset of a text node
   *
   * @param {Text} textNode - The text node which will be split and in which
   *     the DOM will be inserted.
   * @param {Number} offset - The text offset at which the DOM should be
   *     inserted.
   * @param {Node|[Node]|NodeList|String} nodes - Either a {Node}, an array
   *     of {Node}s, a {NodeList} or a string containing HTML that will be
   *     inserted at the given offset in  a text node.
   * @returns {Type.Contents} - This instance
   */
  this.insertHTML = function (textNode, offset, nodes) {

    // Required variables
    var i, parent, insertBeforeNode;

    // Parse string (if given) to retrieve DOM nodes
    nodes = typeof nodes === 'string' ? Type.DomUtilities.parseHTML(nodes) : nodes;

    // Make array if single DOM node was given
    nodes = nodes.length ? nodes : [nodes];

    // Split text and prepare insertion
    insertBeforeNode = textNode.splitText(offset);
    parent = insertBeforeNode.parentNode;

    // If last given DOM node is a text, concat it with the text behind insertion
    if (nodes[nodes.length-1].nodeType === Node.TEXT_NODE) {
      insertBeforeNode.nodeValue = nodes.pop().nodeValue + insertBeforeNode.nodeValue;
    }

    // Insert DOM nodes between split texts
    for (i = nodes.length - 1; i >= 1; i -= 1) {
      parent.insertBefore(nodes[i], insertBeforeNode);
      insertBeforeNode = nodes[i];
    }

    // If first given DOM node is a text, concat it with the text before insertion
    if (nodes[0].nodeType === Node.TEXT_NODE) {
      textNode.nodeValue += nodes[0].nodeValue;
    }

    // Chaining
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

    //var startNode, endNode, startParent, walker, current, prev, startRemoved, currentParent, a, b;
    var startNode, endNode, walker, current, startParent, startRemoved, currentParent, a, b;

    if (arguments.length === 2) {
      range = Type.Range.fromCaret(range, numChars);
    }

    startNode    = range.splitStartContainer();
    endNode      = range.splitEndContainer();
    startParent  = startNode.parentNode;
    walker       = this._type.createDomWalker(endNode, 'textNode');
    //current      = endNode;
    startRemoved = false;

    //prev = endNode;

    if (!this._root.contains(startNode) || !this._root.contains(endNode)) {
      Type.Development.debug('The give startNode and endNode are not contained by the editor.');
      return this;
    }

    while (!startRemoved) {

      current = walker.getNode();
      walker.prev();

      a = (current === endNode && range.endOffset === 0);
      b = (current !== startNode && current === Type.DomWalker.first(current.parentNode, 'textNode'));

      if (a || b) {
        currentParent = current.parentNode;
        Type.DomUtilities.moveAfter(walker.getNode(), current.parentNode.childNodes);
        Type.DomUtilities.removeVisible(currentParent);
      }

      startRemoved = current === startNode;
      Type.DomUtilities.removeVisible(current);
      //current = walker.getNode();

    }


    /*while (!startRemoved) {

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

    }*/

    startParent.normalize();
    //startNode.parentNode.normalize();

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
