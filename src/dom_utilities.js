'use strict';

var Type = require('./core');

/**
 * @constructor
 */
Type.DomUtilities = function () {
};

(function () {

  /**
   * The id attribute of the container element where all the helper
   * elements including carets and input fields of type will be
   * appended to
   *
   * @type {string}
   * @private
   */
  Type.DomUtilities._containerId = Type.Settings.prefix + 'container';


  /**
   * Matches a single HTML tag
   * @type {RegExp}
   * @private
   */
  Type.DomUtilities._singleTag = /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/;

  /**
   * Todo Use me wherever you find document.createElement or this.elementsContainer
   * @param {string} tagName
   * @param {string} [className]
   * @returns {Element}
   */
  Type.DomUtilities.addElement = function (tagName, className) {
    var el = document.createElement(tagName);
    if (className) el.className = Type.Settings.prefix + className;
    this.getElementsContainer().appendChild(el);
    return el;
  };

  /**
   * Removes a DOM element
   * @param {Element} el
   * @returns {*}
   */
  Type.DomUtilities.removeElement = function (el) {
    el.parentNode.removeChild(el);
    return this;
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
  Type.DomUtilities.removeVisible = function (node, constrainingNode) {
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
   * Recursively unwraps the given tag from the element passed an all its children
   * Note to self and future developers, querySelectorAll can be used for this when
   * we drop IE 8 support.
   *
   * @param el
   * @param tag
   * @param deep
   * @returns {Type.DomUtilities}
   */
  Type.DomUtilities.removeTag = function (el, tag, deep) {
    var i;
    if (deep && el.childNodes.length) {
      for (i = 0; i < el.childNodes.length; i += 1) {
        this.removeTag(el.childNodes[i], tag, deep);
      }
    }
    if (el.nodeType === 1 && el.tagName.toLowerCase() === tag.toLowerCase()) {
      this.unwrap(el);
    }
    return this;
  };

  /**
   * Converts a string of HTML to a corresponding {NodeList}
   *
   * @param {String} htmlString - A string containing HTML
   * @returns {NodeList} - The elements represented by the string
   */
  Type.DomUtilities.parseHTML = function(htmlString) {
    var fragment = document.createDocumentFragment(),
      div = fragment.appendChild(document.createElement('div'));
    div.innerHTML = htmlString;
    return div.childNodes;
  };

  /**
   *
   * By Dave Atchley, taken (and modified) from
   * {@link https://gist.github.com/datchley/11383482}
   * No license given. I asked for the license by mail.
   * Still waiting.
   *
   * @param tag
   * @param elms
   * @returns {Element}
   */
  Type.DomUtilities.wrap = function (tag, elms) {

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

    // Return newly created element
    return wrapper;
  };

  /**
   * Todo use this.moveAfter()
   * @param {Node} el
   * @returns {Type.DomUtilities}
   */
  Type.DomUtilities.unwrap = function (el) {

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
  Type.DomUtilities.moveAfter = function (reference, elems) {

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
   * Todo move to dom walker??
   *
   * @param {Node} el
   * @param {String} selector
   * @param {Node} [constrainingNode]
   * @returns {HTMLElement|null}
   */
  Type.DomUtilities.parent = function(el, selector, constrainingNode) {
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
  Type.DomUtilities.matches = function(el, selector) {
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
   *
   * @returns {Element}
   */
  Type.DomUtilities.getElementsContainer = function () {
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
   * @param {Node} container
   * @param {Node} node
   * @returns {boolean}
   */
  Type.DomUtilities.containsButIsnt = function (container, node) {
    return container !== node && container.contains(node);
  };

  /**
   *
   * @param obj
   * @returns {boolean}
   */
  Type.DomUtilities.isNode = function (obj) {
    return !!(obj && obj.nodeType);
  };

  /**
   * Returns true if the given node is visible to the user.
   *
   * @param {Element} el - The element to be checked
   * @returns {boolean}
   * @private
   */
  Type.DomUtilities.isVisible = function (el) {
    return !!el.offsetHeight;
  };

  /**
   * Compares the document positions of two DOM nodes
   *
   * @param {Node} a - A DOM node to compare with the given other node
   * @param {Node} b - A DOM node to compare with the given other node
   * @returns {number} - Returns -1 if a precedes b, 1 if it is the
   *     other way around and 0 if they are equal.
   */
  Type.DomUtilities.order = function (a, b) {
    if (a === b) {
      return 0;
    }
    if (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) {
      return -1;
    }
    return 1;
  };

}).call(Type.DomUtilities);

module.exports = Type.DomUtilities;
