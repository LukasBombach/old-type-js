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
   * Traverses the DOM tree and finds the next node after the node passed
   * as first argument. Will traverse the children, siblings and parents'
   * siblings (in that order) to find the next node in the DOM tree as
   * displayed by the document flow.
   *
   * Todo inline comments to explain code
   *
   * @param {Node} node - The node from which the search should start
   * @param {Object|Node} [options] - If an object is passed, it should
   *     contain settings determining what node to return, see specifics
   *     below. If a {Node} is passed, this acts as options.constrainingNode
   * @param {Function} [options.filterFunction] - nextNode traverses the
   *     DOM tree and passes each node to this function. This function
   *     should return true if the node passed is a node that we look for
   *     or false otherwise. E.g. if we want to find the next text node
   *     in the tree, the function should check if the node passed is of
   *     nodeType === 3. If this parameter is not set, any node found
   *     will be returned.
   * @param {Node} [options.constrainingNode] While traversing the DOM,
   *     this method will check nodes' parents and parents' parents. By
   *     passing a DOM node as this parameter, traversing up will stop at
   *     this node and return null. This is useful when you want to permit
   *     traversing outside the editor's root node.
   * @param {boolean} [options.returnMe] This will determine that if the
   *     search criteria passed as options.filterFunction applies to the
   *     node passed as first argument, that node will be returned
   *     (instead of starting to search after this node). This is mainly
   *     used internally (by recursive calls of this function).
   * @returns {null|Node} The next node in the DOM tree found or null
   *     if none is found for the options.filterFunction criteria or
   *     options.constrainingNode has been hit.
   */
  this.nextNode = function (node, options) {

    // If no options parameter has been passed
    options = options || {};

    // If a node has been passed as options parameter
    if (options.nodeType) {
      options = {constrainingNode: options};
    }

    // For later use
    var parent = node.parentNode;

    if (options.returnMe === true && (!options.filterFunction || options.filterFunction(node))) {
      return node;
    }

    options.returnMe = true;

    if (node.childNodes.length) {
      return this.nextNode(node.childNodes[0], options);
    }

    if (node.nextSibling !== null) {
      return this.nextNode(node.nextSibling, options);
    }

    while (parent !== options.constrainingNode) {
      if (parent.nextSibling !== null) {
        return this.nextNode(parent.nextSibling, options);
      }
      parent = parent.parentNode;
    }

    return null;

  };

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
   *
   * @param {...Node} nodes
   * @returns {boolean}
   */
  this.isTextNode = function (nodes) {
    var i;
    nodes = arguments.length ? arguments : [arguments];
    for (i = 0; i < nodes.length; i += 1) {
      if (nodes[i] && nodes[i].nodeType !== this._TEXT_NODE) {
        return false;
      }
    }
    return true;
  };

  /**
   * Returns true if a give node is a text node and its contents is not
   * entirely whitespace.
   *
   * Todo allow infinite arguments just like isTextNode
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
   * @param {Node} container
   * @param {Node} node
   * @returns {boolean}
   */
  this.containsButIsnt = function (container, node) {
    return container !== node && container.contains(node);
  };

  /**
   * Todo Maybe remove inline comments as they are here for my personal understanding rather than anything else
   *
   * (Modified) from
   * http://stackoverflow.com/questions/3337587/wrapping-a-set-of-dom-elements-using-javascript/13169465#13169465
   * https://gist.github.com/datchley/11383482
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

    // If the first element had a sibling, insert the wrapper before the
    // sibling to maintain the HTML structure; otherwise, just append it
    // to the parent.
    if (sibling) {
      parent.insertBefore(wrapper, sibling);
    } else {
      parent.appendChild(wrapper);
    }

    // Move all elements to the wrapper. Each element is
    // automatically removed from its current parent and
    // from the elms array.
    while (elms.length) {
      wrapper.appendChild(elms[0]);
    }

    // Chaining
    return this;
  };

  /**
   *
   * @param {Node} el
   * @returns {DomUtilities}
   */
  this.unwrap = function (el) {

    var prev     = el.previousSibling,
      next       = el.nextSibling,
      parent     = el.parentNode,
      childNodes = el.childNodes;

    // Commented out in favour of normalize()
    // Todo decide to use normalize or my own methods

    //if (this.isTextNode(prev, el.firstChild)) {
    //  prev.nodeValue += el.firstChild.nodeValue;
    //  el.parentNode.removeChild(el.firstChild);
    //}

    //if (this.isTextNode(next, el.lastChild)) {
    //  next.nodeValue = el.lastChild.nodeValue + next.nodeValue;
    //  el.parentNode.removeChild(el.lastChild);
    //}

    if (next) {
      while (childNodes.length) {
        parent.insertBefore(el.lastChild, next);
      }
    } else {
      while (childNodes.length) {
        parent.appendChild(el.firstChild);
      }
    }

    parent.removeChild(el);
    parent.normalize();

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

    // Required vars, Crockford style
    var i;

    // Recursively remove the given tag from the elements children
    if (deep && el.childNodes.length) {
      for (i = 0; i < el.childNodes.length; i += 1) {
        this.removeTag(el.childNodes[i], tag, deep);
      }
    }

    // Unwrap this tag if it is the tag we want to remove
    if (el.nodeType === 1 && el.tagName.toLowerCase() === el.toLowerCase()) {
      this.unwrap(el);
    }

    // Chaining
    return this;
  };

}).call(DomUtilities.prototype);

singleton = new DomUtilities();
module.exports = singleton;
