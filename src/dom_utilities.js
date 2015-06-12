'use strict';

/**
 *
 * @param el
 * @constructor
 */
function DomUtilities(el) {
  this.el = el;
}

(function () {

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
 *
 * @param el
 * @param returnMe
 * @returns {*}
 */
DomUtilities.nextTextNode = function (el, returnMe, constrainingNode) {

  if (typeof returnMe !== "boolean") {
    constrainingNode = returnMe;
    returnMe = false;
  }

  var parent = el.parentNode;

  if (returnMe === true && DomUtilities.isTextNodeWithContents(el)) {
    return el;
  }

  if (el.childNodes.length) {
    return DomUtilities.nextTextNode(el.childNodes[0], true, constrainingNode);
  }

  if (el.nextSibling !== null) {
    return DomUtilities.nextTextNode(el.nextSibling, true, constrainingNode);
  }

  while (parent !== constrainingNode) {
    if (parent.nextSibling !== null) {
      return DomUtilities.nextTextNode(parent.nextSibling, true, constrainingNode);
    }
    parent = parent.parentNode;
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
