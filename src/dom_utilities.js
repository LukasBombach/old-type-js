'use strict';

function DomUtilities(el) {
  this.el = el;
}

(function () {

  this._TEXT_NODE = 3;

  /**
   * Finds the first visible text node in an element. Will
   * return the element itself, if it is already a text node
   *
   * @param {Node} [el] The element to be searched in. Will
   *     default to the element set in this instance
   * @returns {Node|null}
   */
  this.firstTextNode = function (el) {
    el = el || this.el;
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
   * @param {Node} [node] The node to be checked. Will default to the
   *     element set in this instance
   * @returns {boolean}
   * @private
   */
  this.isTextNodeWithContents = function (node) {
    node = node || this.el;
    return node.nodeType === this._TEXT_NODE && /[^\t\n\r ]/.test(node.textContent);
  };


}).call(DomUtilities.prototype);


module.exports = DomUtilities;
