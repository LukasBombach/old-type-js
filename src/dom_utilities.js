'use strict';

/**
 *
 * @constructor
 */
function DomUtilities() {
}

(function () {

  /**
   * Node.nodeType value for text nodes
   * @type {number}
   * @private
   */
  this._TEXT_NODE = 3;

  /**
   * Finds the first visible text node in an element. Will
   * return the element itself, if it is already a text node
   *
   * Todo Can be removed by using nextTextNode - I think (maybe this method is faster though (still unnecessary code))
   *
   * @param {Node} el The element to be searched in.
   * @returns {Node|null}
   */
  this.firstTextNode = function (el) {
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
   * @param constrainingNode
   * @returns {null|Node}
   */
  this.nextTextNode = function (el, returnMe, constrainingNode) {

    if (typeof returnMe !== "boolean") {
      constrainingNode = returnMe;
      returnMe = false;
    }

    var parent = el.parentNode;

    if (returnMe === true && this.isTextNodeWithContents(el)) {
      return el;
    }

    if (el.childNodes.length) {
      return this.nextTextNode(el.childNodes[0], true, constrainingNode);
    }

    if (el.nextSibling !== null) {
      return this.nextTextNode(el.nextSibling, true, constrainingNode);
    }

    while (parent !== constrainingNode) {
      if (parent.nextSibling !== null) {
        return this.nextTextNode(parent.nextSibling, true, constrainingNode);
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
  this.isTextNodeWithContents = function (node) {
    return node.nodeType === this._TEXT_NODE && /[^\t\n\r ]/.test(node.textContent);
  };

  /**
   *
   * @param tag
   * @param nodesToWrap
   * @returns {DomUtilities}
   */
  this.wrap = function (tag, nodesToWrap) {

    var i;

    if (!Array.isArray(nodesToWrap)) {
      nodesToWrap = [nodesToWrap];
    }

    for (i = 0; i < nodesToWrap.length; i += 1) {
      this.removeTag(nodesToWrap[i], tag, true);
    }

    return this;
  };

  /**
   *
   * @param el
   * @returns {DomUtilities}
   */
  this.unwrap = function (el) {

    // todo should merge newly adjacent text nodes

    return this;
  };

  /**
   *
   * @param el
   * @param tag
   * @param deep
   * @returns {DomUtilities}
   */
  this.removeTag = function (el, tag, deep) {

    var i;

    if (deep && el.children.length) {
      for (i = 0; i < el.children.length; i += 1) {
        this.removeTag(el.children[i], tag, deep);
      }
    }

    if (el.nodeType === 1 && el.tagName.toLowerCase() === el.toLowerCase()) {
      this.unwrap(el);
    }

    return this;

  };

}).call(DomUtilities.prototype);



module.exports = new DomUtilities();
