'use strict';

var Settings = require('./settings');

/**
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
  DomUtilities._containerId = Settings.prefix + 'container';

  /**
   * Todo Use me wherever you find document.createElement or this.elementsContainer
   * @param {string} tagName
   * @param {string} [className]
   * @returns {Element}
   */
  DomUtilities.addElement = function (tagName, className) {
    var el = document.createElement(tagName);
    if (className) el.className = Settings.prefix + className;
    this.getElementsContainer().appendChild(el);
    return el;
  };

  /**
   *
   * @param {Element} el
   * @returns {*}
   */
  DomUtilities.removeElement = function (el) {
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
  DomUtilities.removeVisible = function (node, constrainingNode) {
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
   * Todo Vielleicht funktioniert das hier effektiver mit querySelectorAll anstatt die childNodes zu traversieren
   *
   * @param el
   * @param tag
   * @param deep
   * @returns {DomUtilities}
   */
  DomUtilities.removeTag = function (el, tag, deep) {

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
  DomUtilities.wrap = function (tag, elms) {

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
  DomUtilities.unwrap = function (el) {

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
  DomUtilities.moveAfter = function (reference, elems) {

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
  DomUtilities.parent = function(el, selector, constrainingNode) {
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
  DomUtilities.matches = function(el, selector) {
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
  DomUtilities.getElementsContainer = function () {
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
  DomUtilities.containsButIsnt = function (container, node) {
    return container !== node && container.contains(node);
  };

  /**
   *
   * @param obj
   * @returns {boolean}
   */
  DomUtilities.isNode = function (obj) {
    return !!(obj && obj.nodeType);
  };

  /**
   * Returns true if the given node is visible to the user.
   *
   * @param {Element} el - The element to be checked
   * @returns {boolean}
   * @private
   */
  DomUtilities.isVisible = function (el) {
    return !!el.offsetHeight;
  };


}).call(DomUtilities);

module.exports = DomUtilities;
