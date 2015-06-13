'use strict';

var singleton;

/**
 *
 * @constructor
 */
function DomUtilities() {
}

(function () {

  /**
   * Node.nodeType value for text nodes
   *
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
    for (i = 0; i < el.childNodes.length; i += 1) {
      child = this.firstTextNode(el.childNodes[i]);
      if (child) {
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
   * (Modified) from
   * http://stackoverflow.com/questions/3337587/wrapping-a-set-of-dom-elements-using-javascript/13169465#13169465
   *
   * @param tag
   * @param elms
   * @returns {DomUtilities}
   */
  this.wrap = function (tag, elms) {

    // Even out parameters
    elms  = elms.length ? elms : [elms];

    // Prepare vars and cache the current parent
    // and sibling of the first element.
    var el    = elms[0],
      parent  = el.parentNode,
      sibling = el.nextSibling,
      wrapper = document.createElement(tag),
      i;

    // Remove the tag we want to wrap from contents
    // so we don't have the same tag nested
    for (i = 0; i < elms.length; i += 1) {
      this.removeTag(elms[i], tag, true);
    }

    // Move all elements to the wrapper. Each element is
    // automatically removed from its current parent and
    // from the elms array.
    while (elms.length) {
      wrapper.appendChild(elms[0]);
    }

    // If the first element had a sibling, insert the wrapper before the
    // sibling to maintain the HTML structure; otherwise, just append it
    // to the parent.
    if (sibling) {
      parent.insertBefore(wrapper, sibling);
    } else {
      parent.appendChild(wrapper);
    }

    // Chaining
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

singleton = new DomUtilities();
module.exports = singleton;
