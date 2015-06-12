'use strict';

function DomUtilities(el) {
  this.el = el;
}

(function () {

  /**
   * Finds the first visible text node in an element. Will
   * return the element itself, if it is already a text node
   *
   * @returns {Node|null}
   */
  this.firstTextNode = function () {
    return DomUtilities.firstTextNode(this.el);
  };

  /**
   * Returns true if a give node is a text node and its contents is not
   * entirely whitespace.
   *
   * @returns {boolean}
   * @private
   */
  this.isTextNodeWithContents = function () {
    return DomUtilities.isTextNodeWithContents(this.el);
  };

}).call(DomUtilities.prototype);

/**
 * Node.nodeType value for text nodes
 * @type {number}
 * @private
 */
DomUtilities._TEXT_NODE = 3;

/**
 * Finds the first visible text node in an element. Will
 * return the element itself, if it is already a text node
 *
 * @param {Node} el The element to be searched in.
 * @returns {Node|null}
 */
DomUtilities.firstTextNode = function (el) {
  var i, child;
  if (this.isTextNodeWithContents(el)) {
    return el;
  }
  for (i = 0; i < el.childNodes.length; i++) {
    if (child = this.firstTextNode(el.childNodes[i])) {
      return child;
    }
  }
  return null;
};

/**
 * Returns true if a give node is a text node and its contents is not
 * entirely whitespace.
 *
 * @param {Node} node The node to be checked.
 * @returns {boolean}
 * @private
 */
DomUtilities.isTextNodeWithContents = function (node) {
  node = node || this.el;
  return node.nodeType === DomUtilities._TEXT_NODE && /[^\t\n\r ]/.test(node.textContent);
};




module.exports = DomUtilities;
