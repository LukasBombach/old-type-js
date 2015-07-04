'use strict';

var Settings = require('./settings');

var singleton;

/**
 * todo holy fuck. refactor me.
 * @constructor
 */
function DomUtilities() {
}

(function () {

  /**
   * The id attribute of the container element where all the helper
   * elements including carets and input fields of type will be
   * appended to
   *
   * @type {string}
   * @private
   */
  this._containerId = Settings.prefix + 'container';

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
   * todo use next(), this is deprecated
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
   * @param {boolean} [options.returnMe] This should not be passed by the
   *     programmer, it is used internally for recursive function calls to
   *     determine if the current node should be returned or not. If the
   *     programmer passes a node and does *not* pass this argument, the
   *     node passed will not be considered for returning. After that,
   *     internally, this will be set to true and be passed on with the
   *     next node in the DOM to a recursive call. The node then passed to
   *     this method might be the node we are looking for, so having this
   *     set to true will return that node (given that the filterFunction
   *     also returns true for that node)
   * @returns {null|Node} The next node in the DOM tree found or null
   *     if none is found for the options.filterFunction criteria or
   *     options.constrainingNode has been hit.
   * @deprecated
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

    // If a node is found in this call, return it, stop the recursion
    if (options.returnMe === true && (!options.filterFunction || options.filterFunction(node))) {
      return node;
    }

    // Will make future recursive calls consider to return the nodes passed
    options.returnMe = true;

    // 1. If this node has children, go down the tree
    if (node.childNodes.length) {
      return this.nextNode(node.childNodes[0], options);
    }

    // 2. If this node has siblings, move right in the tree
    if (node.nextSibling !== null) {
      return this.nextNode(node.nextSibling, options);
    }

    // 3. Move up in the node's parents until a parent has a sibling or the constrainingNode is hit
    while (parent !== options.constrainingNode) {
      if (parent.nextSibling !== null) {
        return this.nextNode(parent.nextSibling, options);
      }
      parent = parent.parentNode;
    }

    // We have not found a node we were looking for
    return null;

  };

  /**
   * Traverses the DOM tree and finds the next node after the node passed
   * as first argument. Will traverse the children, siblings and parents'
   * siblings (in that order) to find the next node in the DOM tree as
   * displayed by the document flow.
   *
   * todo https://developer.mozilla.org/en-US/docs/Web/API/Document/createTreeWalker
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
   * @param {boolean} [options.returnMe] This should not be passed by the
   *     programmer, it is used internally for recursive function calls to
   *     determine if the current node should be returned or not. If the
   *     programmer passes a node and does *not* pass this argument, the
   *     node passed will not be considered for returning. After that,
   *     internally, this will be set to true and be passed on with the
   *     next node in the DOM to a recursive call. The node then passed to
   *     this method might be the node we are looking for, so having this
   *     set to true will return that node (given that the filterFunction
   *     also returns true for that node)
   * @returns {null|Node} The next node in the DOM tree found or null
   *     if none is found for the options.filterFunction criteria or
   *     options.constrainingNode has been hit.
   */
  this.next = function (node, options) {

    // If no options parameter has been passed
    options = options || {};

    // If a node has been passed as options parameter
    if (options.nodeType) {
      options = {constrainingNode: options};
    }

    // If a function has been passed as ooptions parameter
    if (this._isFunction(options)) {
      options = {filterFunction: options};
    }

    // For later use
    var parent = node.parentNode;

    // If a node is found in this call, return it, stop the recursion
    if (options.returnMe === true && (!options.filterFunction || options.filterFunction(node))) {
      return node;
    }

    // Will make future recursive calls consider to return the nodes passed
    options.returnMe = true;

    // 1. If this node has children, go down the tree
    if (node.childNodes.length) {
      return this.next(node.childNodes[0], options);
    }

    // 2. If this node has siblings, move right in the tree
    if (node.nextSibling !== null) {
      return this.next(node.nextSibling, options);
    }

    // 3. Move up in the node's parents until a parent has a sibling or the constrainingNode is hit
    while (parent !== options.constrainingNode) {
      if (parent.nextSibling !== null) {
        return this.next(parent.nextSibling, options);
      }
      parent = parent.parentNode;
    }

    // We have not found a node we were looking for
    return null;

  };

  /**
   *
   * @param {Node} node
   * @param options
   * @returns {Node|null}
   */
  this.prev = function (node, options) {

    // If no options parameter has been passed
    options = options || {};

    // If a node has been passed as options parameter
    if (options.nodeType) {
      options = {constrainingNode: options};
    }

    // If a function has been passed as ooptions parameter
    if (this._isFunction(options)) {
      options = {filterFunction: options};
    }

    // For later use
    var parent = node.parentNode;

    // If a node is found in this call, return it, stop the recursion
    if (options.returnMe === true && (!options.filterFunction || options.filterFunction(node))) {
      return node;
    }

    // Will make future recursive calls consider to return the nodes passed
    options.returnMe = true;

    // 1. If this node has children, go down the tree
    if (node.childNodes.length) {
      return this.prev(node.lastChild, options);
    }

    // 2. If this node has siblings, move right in the tree
    if (node.previousSibling !== null) {
      return this.prev(node.previousSibling, options);
    }

    // 3. Move up in the node's parents until a parent has a sibling or the constrainingNode is hit
    while (parent !== options.constrainingNode) {
      if (parent.previousSibling !== null) {
        return this.prev(parent.previousSibling, options);
      }
      parent = parent.parentNode;
    }

    // We have not found a node we were looking for
    return null;

  };

  /**
   *
   * @param {Node} node
   * @returns {null|Node}
   */
  this.nextVisible = function (node) {
    var self = this;
    return this.next(node, function(node) { return self.isVisible(node) });
  };

  /**
   * Will remove a node and each parent (recursively) if removing
   * leaves the parent with no *visible* content
   *
   * @param {Node} node - The node to remove
   * @param {Node} [constrainingNode] - The algorithm will stop and
   *     not remove this node if it reaches it
   * @returns {Node|null} - Will return the parent node where this
   *     algorithm stopped (The node it did *not* delete)
   */
  this.removeVisible = function (node, constrainingNode) {
    var parent = node.parentNode;
    if (node === constrainingNode) return node;
    if (node === document.body) return node;
    if (parent === null) return null;
    parent.removeChild(node);
    if (!this.isVisible(parent))
      return this.removeVisible(parent, constrainingNode);
    return parent;
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
   * @param {Node} node
   * @param {Node} [constrainingNode]
   * @returns {Node|null|*}
   */
  this.prevTextNode = function (node, constrainingNode) {
    var self = this, options = {};
    options.filterFunction = function(node) { return self.isTextNodeWithContents(node) };
    options.constrainingNode = constrainingNode;
    return this.prev(node, options);
  };

  /**
   *
   * @param {Node} containingNode
   * @returns {Node|null}
   */
  this.lastTextNode = function (containingNode) {
    var self = this;
    return this.prev(containingNode, function(node) { return self.isTextNodeWithContents(node) });
  };

  /**
   * Todo Perfomancemäßig schlecht immer zu iterieren?
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
   * Returns whether or not the node is or contains any
   * visible text nodes
   *
   * @param {Node} node
   * @returns {boolean}
   */
  this.isVisible = function (node) {
    var i;
    if (this.isTextNodeWithContents(node))
      return true;
    for (i = 0; i< node.childNodes.length; i += 1) {
      if (this.isVisible(node.childNodes[i])) return true;
    }
    return false;
  };

  /**
   * Returns true if a give node is a text node and its TypeContents is not
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
    for (i = 0; i < elms.length; i += 1) {
      wrapper.appendChild(elms[i]);
    }

    // Remove the tag we want to wrap from TypeContents
    // so we don't have the same tag nested
    for (i = 0; i < elms.length; i += 1) {
      this.removeTag(elms[i], tag, true);
    }

    // Chaining
    return this;
  };

  /**
   * Todo use this.moveAfter()
   * @param {Node} el
   * @returns {DomUtilities}
   */
  this.unwrap = function (el) {

    var next     = el.nextSibling,
      parent     = el.parentNode,
      childNodes = el.childNodes;

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
   * @param reference
   * @param elems
   * @returns {*}
   */
  this.moveAfter = function (reference, elems) {

    var i;

    var next = reference.nextSibling,
      parent = reference.parentNode;

    elems = !elems.length ? [elems] : Array.prototype.slice.call(elems, 0);

    if (next) {
      for (i = 0; i < elems.length; i += 1) {
        parent.insertBefore(elems[i], next);
      }
    } else {
      for (i = 0; i < elems.length; i += 1) {
        parent.appendChild(elems[i]);
      }
    }

    return this;
  };

  /**
   * Todo Vielleicht funktioniert das hier effektiver mit querySelectorAll anstatt die childNodes zu traversieren
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
    if (el.nodeType === 1 && el.tagName.toLowerCase() === tag.toLowerCase()) {
      this.unwrap(el);
    }

    // Chaining
    return this;
  };

  /**
   *
   * @param {Node} el
   * @param {String} selector
   * @param {Node} [constrainingNode]
   * @returns {HTMLElement|null}
   */
  this.parent = function(el, selector, constrainingNode) {
    while (el.parentNode && (!constrainingNode || el !== constrainingNode)) {
      if (this.matches(el, selector)) {
        return el;
      }
      el = el.parentNode;
    }
    return null;
  };

  /**
   * Returns true if el matches the CSS selector given as second argument,
   * otherwise false
   *
   * Todo http://davidwalsh.name/element-matches-selector
   *
   * @param el
   * @param selector
   * @returns {boolean}
   */
  this.matches = function(el, selector) {
    var _matches = (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector);

    if (_matches) {
      return _matches.call(el, selector);
    } else {
      var nodes = el.parentNode.querySelectorAll(selector);
      for (var i = nodes.length; i--;) {
        if (nodes[i] === el)
          return true;
      }
      return false;
    }
  };

  /**
   * Todo Use me wherever you find document.createElement or this.elementsContainer
   * @param {string} tagName
   * @param {string} [className]
   * @returns {Element}
   */
  this.addElement = function (tagName, className) {
    var el = document.createElement(tagName);
    if (className) el.className = Settings.prefix + className;
    this.elementsContainer().appendChild(el);
    return el;
  };

  /**
   *
   * @param {Element} el
   * @returns {*}
   */
  this.removeElement = function (el) {
    el.parentNode.removeChild(el);
    return this;
  };

  /**
   *
   * @returns {Element}
   */
  this.elementsContainer = function () {
    var container = window.document.getElementById(this._containerId);
    if (container === null) {
      container = window.document.createElement('div');
      container.setAttribute('id', this._containerId);
      window.document.body.appendChild(container);
    }
    return container;
  };

  /**
   *
   * @param obj
   * @returns {boolean}
   */
  this.isNode = function (obj) {
    return !!(obj && obj.nodeType);
  };


  /**
   * todo constraining node
   * @param {Node} fromNode
   * @param {number} offset
   * @param {number} [startOffset]
   * @returns {{node:Node,offset:number}|null} - The node and the offset to its
   *     start or null if no node could be found
   */
  this.textNodeAt = function (fromNode, offset, startOffset) {

    var node = fromNode,
      offsetWalked = 0,
      length;

    startOffset = startOffset || 0;
    offset += startOffset;

    if (fromNode.nodeType === 3 && offset >= 0 && offset <= fromNode.nodeValue.length) {
      return { node: fromNode, offset: offset };
    }

    if (offset < 0) {
      while (node = this.prevTextNode(node)) {
        length = node.nodeValue.length;
        if (offsetWalked - length <= offset) {
          return { node: node, offset: length+(offset-offsetWalked) };
        }
        offsetWalked -= length;
      }

    } else {
      while (node = this.nextTextNode(node)) {
        length = node.nodeValue.length;
        if (offsetWalked + length >= offset) {
          return { node: node, offset: offset-offsetWalked };
        }
        offsetWalked += length;
      }
    }

    return null;

  };

  /**
   *
   * @param fromNode
   * @param toNode
   * @param toOffset
   * @returns {*}
   */
  this.getTextOffset = function (fromNode, toNode, toOffset) {

    var node = this.nextTextNode(fromNode, true),
      offsetWalked = 0;

    toOffset = toOffset || 0;

    do {
      if (node === toNode) {
        return offsetWalked + toOffset;
      }
      offsetWalked += node.nodeValue.length;
    } while (node = this.nextTextNode(node));

    return null;

  };

  /**
   *
   * @param obj
   * @returns {boolean}
   * @private
   */
  this._isFunction = function(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  };

}).call(DomUtilities.prototype);

singleton = new DomUtilities();
module.exports = singleton;
