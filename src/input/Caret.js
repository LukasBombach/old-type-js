'use strict';

var Settings = require('../core').settings;

/**
 * An editor's caret. We cannot use the browser's native caret since we do not utilize
 * native inputs (a textarea or an element that is set to contenteditable). We emulate
 * a caret with a blinking div. This class manages that div and provides methods to
 * position it.
 *
 * @class Caret
 **/

/**
 * Creates a new Caret and adds a hidden div (visual representation of the caret) to
 * the DOM
 *
 * @constructor
 */
function Caret() {
  this.caretEl = this._createElement();
  this._hide();
}

(function () {

  /**
   * The id attribute of the caret container element
   *
   * @type {string}
   * @private
   */
  this._containerId = Settings.prefix + 'caret-container';

  /**
   * Moves the caret left by one character
   *
   * @returns {Caret}
   */
  this.moveLeft = function () {
    if (this.offset <= 0) {
      return this;
    }
    this._setOffset(this.offset - 1);
    return this;
  };

  /**
   * Moves the caret right by one character
   *
   * @returns {Caret}
   */
  this.moveRight = function () {
    if (this.offset >= this.textNode.length) {
      return this;
    }
    this._setOffset(this.offset + 1);
    return this;
  };

  /**
   * Moves the caret up by one line. Tries to preserve horizontal position.
   * Todo needs refactoring, moving up a) not accurate, b) buggy
   *
   * @returns {Caret}
   */
  this.moveUp = function () {
    var searched,
      current = this._getRectAtOffset(this.textNode, this.offset),
      charOffset = this.offset;
    do {
      searched = this._getRectAtOffset(this.textNode, charOffset);
      charOffset--;
      if(charOffset < 0) {
        return this;
      }
    } while (searched.top === current.top || searched.right > current.right);
    this._setOffset(charOffset);
    return this;
  };

  /**
   * Moves the caret down by one line. Tries to preserve horizontal position.
   * Todo needs refactoring, moving down a) not accurate, b) buggy
   *
   * @returns {Caret}
   */
  this.moveDown = function () {
    var searched,
      current = this._getRectAtOffset(this.textNode, this.offset),
      charOffset = this.offset;
    do {
      searched = this._getRectAtOffset(this.textNode, charOffset);
      charOffset++;
      if(charOffset >= this.textNode.length) {
        return this;
      }
    } while (searched.top === current.top || searched.right < current.right);
    this._setOffset(charOffset);
    return this;
  };

  /**
   * Places the caret in a text node at a given position
   * Todo Merge method with moveToAndShowAtOffset
   *
   * @param {Node} node - The (text) {Node} in which the caret should be placed
   * @param {number} offset - The character offset where the caret should be moved to
   * @returns {Caret}
   */
  this.moveTo = function (node, offset) {
    if (!(node instanceof Node) || node.nodeType !== Node.TEXT_NODE) {
      throw new Error('node parameter must be a Node of type Node.TEXT_NODE');
    }
    if (node === this.textNode && offset === null) {
      return this;
    }
    this.textNode = node;
    this._setOffset(offset || 0);
    return this;
  };

  /**
   * Sets the offset and displays the caret at the according
   * position
   *
   * @param {number} offset - The offset that should be set
   * @returns {Caret}
   */
  this._setOffset = function (offset) {
    this.offset = offset;
    this._positionAtOffset();
    this._resetBlink();
    this._scrollIntoView();
    return this;
  };

  /**
   * Inserts a given {string} at the caret's current offset in the caret's
   * current text node
   *
   * @param {string} str - The {string} that will be be inserted
   * @returns {Caret}
   */
  this.insertTextAtOffset = function (str) {
    var nodeText = this.textNode.nodeValue;
    if (this.offset > 0) {
      this.textNode.nodeValue = nodeText.substring(0, this.offset)
        + str
        + nodeText.substring(this.offset, nodeText.length);
    } else {
      this.textNode.nodeValue = str + nodeText;
    }
    this.moveRight();
    return this;
  };

  /**
   * Removes one character left from the current offset
   * and moves the caret accordingly
   *
   * @returns {Caret}
   */
  this.removeCharacterAtOffset = function () {
    if (this.offset <= 0) {
      return this;
    }
    var str = this.textNode.nodeValue;
    this.textNode.nodeValue = str.substring(0, this.offset - 1)
      + str.substring(this.offset, str.length);
    this._setOffset(this.offset - 1);
    return this;
  };

  /**
   * Removes the caret div from the DOM. Also removes the caret
   * container if there are no more carets in it
   *
   * @returns {Caret}
   */
  this.destroy = function () {
    if (typeof this.caretEl !== "object") {
      return this;
    }
    var container = this._getElementContainer();
    container.removeChild(this.caretEl);
    if (!container.hasChildNodes()) {
      container.parentNode.removeChild(container);
    }
    this.caretEl = null;
    return this;
  };

  /**
   * Moves the caret div to the position of the current offset
   *
   * @returns {Caret}
   * @private
   */
  this._positionAtOffset = function () {
    var rect = this._getRectAtOffset(this.textNode, this.offset);
    this._postitionAt(rect.left, rect.top);
    return this;
  };

  /**
   * Moves the caret to the given position
   *
   * @param {number} x Horizontal position the caret should be moved to
   * @param {number} y Vertical position the caret should be moved to
   * @returns {Caret}
   * @private
   */
  this._postitionAt = function (x, y) {
    this.caretEl.style.left = x + 'px';
    this.caretEl.style.top = y + 'px';
    return this;
  };

  /**
   * Scrolls page to show caret
   *
   * @returns {Caret}
   * @private
   */
  this._scrollIntoView = function () {
    this.caretEl.scrollIntoView();
    return this;
  };

  /**
   * Makes the caret blink
   *
   * @returns {Caret}
   */
  this._blink = function () {
    this._removeClass(this.caretEl, 'hide');
    this._addClass(this.caretEl, 'blink');
    return this;
  };

  /**
   * Hides the caret
   *
   * @returns {Caret}
   */
  this._hide = function () {
    this._removeClass(this.caretEl, 'blink');
    this._addClass(this.caretEl, 'hide');
    return this;
  };


  /**
   * Resets the blink animation by recreating the caret div element
   * Todo Maybe find a better way to reset the blink animation, DOM = slow
   *
   * @returns {Caret}
   * @private
   */
  this._resetBlink = function () {
    var newCaret = this.caretEl.cloneNode(true);
    this.caretEl.parentNode.replaceChild(newCaret, this.caretEl);
    this.caretEl = newCaret;
    return this;
  };

  /**
   * Utility method to add a class to an element
   * Todo There should be a separate utility module for stuff like this
   *
   * @param {Element} el - The {Element} that the class should be added to
   * @param {string} className - The class to be removed
   * @returns {Caret}
   * @private
   */
  this._addClass = function (el, className) {
    if (el.classList) {
      el.classList.add(className);
    } else {
      el.className += ' ' + className;
    }
    return this;
  };

  /**
   * Utility method to remove a class from an element
   * Todo There should be a separate utility module for stuff like this
   *
   * @param {Element} el - The {Element} that the class should be removed from
   * @param {string} className - The class to be removed
   * @returns {Caret}
   * @private
   */
  this._removeClass = function (el, className) {
    if (el.classList) {
      el.classList.remove(className);
    } else {
      var regex = new RegExp('(^|\\b)' + className.split(' ')
          .join('|') + '(\\b|$)', 'gi');
      el.className = el.className.replace(regex, ' ');
    }
    return this;
  };

  /**
   * Returns a {ClientRect} with the boundaries enclosing a character at a
   * given offset in a text node
   *
   * @param {Node} node - The text node which containing the character we
   *     which to fetch the boundaries of
   * @param {number} offset - The offset of the character we which to fetch
   *     the boundaries of
   * @returns {ClientRect}
   * @private
   */
  this._getRectAtOffset = function (node, offset) {
    var rects = this._createRange(node, offset).getClientRects();
    return rects[0];
  };

  /**
   * Creates a {Range} and returns it
   *
   * @param {Node} startNode - The node in which the created range should begin
   * @param {number} start - The offset at which the range should start
   * @param {number} [end=start] - The offset at which the range should end
   *     Optional. Defaults to the start offset.
   * @param {Node} [endNode=node] - The node in which the created range should end.
   *     Optional. Defaults to the start node.
   * @returns {Range}
   * @private
   */
  this._createRange = function(startNode, start, end, endNode) {
    var range = window.document.createRange();
    range.setEnd(endNode || startNode, end || start);
    range.setStart(startNode, start);
    return range;
  };

  /**
   * Creates a div (the visual representation of the caret) and returns it.
   *
   * @returns {HTMLElement}
   * @private
   */
  this._createElement = function () {
    var container = this._getElementContainer(),
        el = window.document.createElement('div');
    el.className = Settings.prefix + 'caret';
    container.appendChild(el);
    return el;
  };

  /**
   * Returns the container to which all caret divs will be appended.
   * Creates the container if it has not been created yet.
   *
   * @returns {HTMLElement}
   * @private
   */
  this._getElementContainer = function () {
    var container = window.document.getElementById(this._containerId);
    if (container === null) {
      container = window.document.createElement('div');
      container.setAttribute('id', this._containerId);
      window.document.body.appendChild(container);
    }
    return container;
  }

}).call(Caret.prototype);

/**
 * @type {Caret}
 */
module.exports = Caret;
