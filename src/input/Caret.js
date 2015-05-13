'use strict';

var Settings = require('../Settings');

/**
 * An editor's caret. We cannot use the browser's native caret since we do not utilize
 * native inputs (a textarea or an element that is set to contenteditable). We emulate
 * a caret with a blinking div. This class manages that div and provides methods to
 * position it.
 *
 * Creates a new Caret and adds a hidden div (visual representation of the caret) to
 * the DOM
 *
 * @class Caret
 * @constructor
 */
function Caret() {
  this.caretEl = this._createElement();
  this._hide();
}

(function () {

  /**
   * The id attribute of the caret container element as created by
   * _getElementContainer()
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
   * Moves the caret up by one line.
   * Tries to preserve horizontal position.
   *
   * Internally, this will create a collapsed range at the caret's offset and move
   * it left, character by character, and stop in the line above the caret when it's
   * horizontally aligned with it. The caret will then be moved to that position.
   *
   * @returns {Caret}
   */
  this.moveUp = function () {

    // Shorthand variables
    var node = this.textNode,
      offset = this.offset;

    // Initial range and positions
    var range  = this._createRange(node, offset),
      rangePos = this._getPositionsFromRange(range),
      caretPos = this._getRectAtOffset(this.offset),
      lastRangeLeft;

    // Move the range as described in the method's description
    while( offset > 0 &&
    (rangePos.top == caretPos.top|| rangePos.left > caretPos.left)) {
      offset--;
      range.setStart(node, offset);
      range.collapse(true);
      lastRangeLeft = rangePos.left;
      rangePos = this._getPositionsFromRange(range);
    }

    // If the range moved up, check 2 characters above the caret to find a precise pos.
    if(rangePos.top < caretPos.top) {
      if(this._compareDeltaTo(caretPos.left, lastRangeLeft, rangePos.left) == -1) {
        offset += 1;
      }
      this._setOffset(offset);
    }

    // Chaining
    return this;
  };

  /**
   * Moves the caret down by one line.
   * Tries to preserve horizontal position.
   *
   * @returns {Caret}
   */
  this.moveDown = function () {

    // Shorthand variables
    var node = this.textNode,
      offset = this.offset;

    // We are gonna create a range and move it through
    // the text until it is positioned 1 line below
    // the caret's position at around the same horizontal
    // position
    var range  = this._createRange(node, offset),
      rangePos = this._getPositionsFromRange(range),
      caretPos = this._getRectAtOffset(this.offset),
      lastRangeRight;

    // Move the range right letter by letter. The range will start
    // in the same line and we keep moving it until it reaches the
    // next line and stop moving when it has moved further right
    // than the caret. That means the range will be one line below
    // the caret and in about the same horizontal position.
    while( offset < node.length &&
      (rangePos.bottom == caretPos.bottom || rangePos.right < caretPos.right)) {
      offset++;
      range.setEnd(node, offset);
      range.collapse(false);
      lastRangeRight = rangePos.right;
      rangePos = this._getPositionsFromRange(range);
    }

    // The text might have only one line, we check to see if the range
    // has actually moved lower than the caret and then move the caret
    // In any case we moved the offset too far by 1 character so we
    // we need to subtract it
    if(rangePos.bottom > caretPos.bottom) {
      if(this._compareDeltaTo(caretPos.right, lastRangeRight, rangePos.right) == -1) {
        offset -= 1;
      }
      this._setOffset(offset);
    }

    // Chaining
    return this;
  };

  /**
   * Places the caret in a text node at a given position
   *
   * @param {Node} node - The (text) {Node} in which the caret should be placed
   * @param {number} [offset=0] - The character offset where the caret should be moved to
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
   * Inserts a given {string} at the caret's current offset in the caret's
   * current text node
   *
   * @param {string} str - The {string} that will be be inserted
   * @returns {Caret}
   */
  this.insertText = function (str) {
    var nodeText = this.textNode.nodeValue;
    if (this.offset > 0) {
      this.textNode.nodeValue = nodeText.substring(0, this.offset)
        + str
        + nodeText.substring(this.offset, nodeText.length);
    } else {
      this.textNode.nodeValue = str + nodeText;
    }
    this._setOffset(this.offset + str.length);
    return this;
  };

  /**
   * Removes one character left from the current offset
   * and moves the caret accordingly
   *
   * @param {number} numChars - Home many characters should be removed
   *     from the caret's position. A negative number will remove
   *     characters left from the caret, a positive number from the right.
   * @returns {Caret}
   */
  this.removeCharacter = function (numChars) {
    numChars = numChars || -1;
    if ( (this.offset <= 0 && numChars < 0) || (this.offset >= this.textNode.length && numChars > 0) ) {
      return this;
    }
    var str = this.textNode.nodeValue;
    if(numChars < 0) {
      this.textNode.nodeValue = str.substring(0, this.offset + numChars)
        + str.substring(this.offset, str.length);
      this._setOffset(this.offset + numChars);
    } else {
      this.textNode.nodeValue = str.substring(0, this.offset)
        + str.substring(this.offset + numChars, str.length);
    }
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
   * Sets the offset and displays the caret at the according
   * position
   *
   * @param {number} offset - The offset that should be set
   * @returns {Caret}
   */
  this._setOffset = function (offset) {
    this.offset = offset;
    this._moveElToOffset();
    this._resetBlink();
    this._scrollIntoView();
    return this;
  };

  /**
   * Moves the caret div to the position of the current offset
   *
   * @returns {Caret}
   * @private
   */
  this._moveElToOffset = function () {
    var rect = this._getRectAtOffset(this.offset);
    this._moveElTo(rect.left, rect.top);
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
  this._moveElTo = function (x, y) {
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
   * Calculates The delta between a given the pivot (a {number}) and a as
   * well as b (both {number}s) and returns -1 if a is closer to pivot,
   * 1 of b is closer to pivot and 0 if both numbers are equally close.
   *
   *
   * @param {number} pivot - A number to which a and be will be compared to
   * @param {number} a - An arbitrary number
   * @param {number} b - An arbitrary number
   * @returns {number}
   * @private
   */
  this._compareDeltaTo = function (pivot, a, b) {
    var deltaA = Math.abs(pivot - a),
        deltaB = Math.abs(pivot - b);
    if (deltaA == deltaB) return 0;
    return deltaA < deltaB ? -1 : 1;
  };

  /**
   * Returns a {ClientRect} with the boundaries enclosing a character at a
   * given offset in a text node
   *
   * @param {Node} [node=this.textNode] - The text node which containing the
   *     character we which to fetch the boundaries of.
   * @param {number} offset - The offset of the character we which to fetch
   *     the boundaries of
   * @returns {{top: number, right: number, bottom: number, left: number}}
   * @private
   */
  this._getRectAtOffset = function (node, offset) {
    if (typeof node === "number") {
      offset = node;
      node = this.textNode;
    }
    return this._getPositionsFromRange(this._createRange(node, offset));
  };

  /**
   * Returns the positions from a {ClientRect} relative to the scroll
   * position
   *
   * @param {Range} range The {Range} that should be measured
   * @returns {{top: number, right: number, bottom: number, left: number}}
   * @private
   */
  this._getPositionsFromRange = function (range) {
    var scroll = this._getScrollPosition();
    var rect = range.getClientRects()[0];
    return {
      top    : rect.top + scroll.top,
      right  : rect.right + scroll.left,
      bottom : rect.bottom + scroll.top,
      left   : rect.left + scroll.left
    };
  };

  /**
   * Return's the window's horizontal an vertical scroll positions
   *
   * @returns {{top: (number), left: (number)}}
   * @private
   */
  this._getScrollPosition = function () {
    return {
      top  : window.pageYOffset || document.documentElement.scrollTop,
      left : window.pageXOffset || document.documentElement.scrollLeft
    };
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
   * All div representations of carets will be appended to a single
   * container. This method returns this container and creates it
   * if it has not been created yet.
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

module.exports = Caret;
