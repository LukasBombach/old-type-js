'use strict';

function textNodeNode(options) {
  options = options || {};
  this.prev = options.prev;
  this.next = options.next;
}


/**
 * Type js core from which we will read settings
 * @private
 * @type {Type}
 */
//var Type = require('../core');

/**
 * The id attribute of the container element
 * @private
 * @type {string}
 */
var containerId = 'typejs-' + 'caret-container';

/**
 * Returns the container which all caret divs will be appended to
 * Creates the container if it has not been created yet
 * @private
 * @returns {HTMLElement}
 */
function getElementContainer() {
  var container = window.document.getElementById(containerId);
  if (container === null) {
    container = window.document.createElement('div');
    container.setAttribute('id', containerId);
    window.document.body.appendChild(container);
  }
  return container;
}

/**
 * Adds a class to an element
 * @private
 * @param el
 * @param className
 */
function addClass(el, className) {
  if (el.classList) {
    el.classList.add(className);
  } else {
    el.className += ' ' + className;
  }
}

/**
 * Removes a class from an element
 * @private
 * @param el
 * @param className
 */
function removeClass(el, className) {
  if (el.classList) {
    el.classList.remove(className);
  } else {
    var regex = new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi');
    el.className = el.className.replace(regex, ' ');
  }
}

/**
 * An editor's caret. We cannot use the browser's native caret since we do not utilize
 * native inputs (a textarea or an element that is set to contenteditable). We emulate
 * a caret with a blinking div. This class manages that div and provides methods to
 * position it.
 *
 * @constructor
 */
function Caret() {
  this.caretEl = this._createElement();
  this.hide();
}

(function () {

  /**
   * Places the caret in a text node at a given position
   *
   * @param {Node} node - The (text) {Node} in which the caret should be placed
   * @param {number} offset - The character offset where the caret should be moved to
   * @returns {Caret}
   */
  this.setTextNode = function (node, offset) {
    if (!(node instanceof Node) || node.nodeType !== Node.TEXT_NODE) {
      throw new Error('textNode parameter must be a Node of type Node.TEXT_NODE');
    }
    if (node === this.textNode && offset === null) {
      return this;
    }
    this.textNode = node;
    this.offset = offset || 0;
    // todo should trigger event that positions the caret visually
    var rect = this._getRectForCharacter(this.textNode, this.offset);
    //this.positionByOffset(); // todo trigger by event
    var x = this.offset === 0 ? rect.left : rect.right;
    this.moveTo(x, rect.top);
    this.resetBlink();
    return this;
  };

  /**
   * Hides the caret visually
   *
   * @returns {Caret}
   */
  this.hide = function () {
    removeClass(this.caretEl, 'blink');
    addClass(this.caretEl, 'hide');
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
  this._getRectForCharacter = function (node, offset) {
    var rects = this._createRange(node, offset, offset + 1).getClientRects();
    return rects[0];
  };

  /**
   * Creates a {Range} and returns it
   *
   * @param {Node} node - The node in which the created range should begin
   * @param {number} start - The offset at which the range should start
   * @param {number} end - The offset at which the range should end
   * @param {Node} [endNode=node] - The node in which the created range should end.
   *     Optional. Defaults to the start node.
   * @returns {Range}
   * @private
   */
  this._createRange = function(node, start, end, endNode) {
    var range = window.document.createRange();
    range.setEnd(endNode || node, end);
    range.setStart(node, start);
    return range;
  };

  /**
   * Creates a div (the visual representation of the caret) and returns it.
   *
   * @returns {HTMLElement}
   * @private
   */
  this._createElement = function () {
    var container = getElementContainer(),
        el = window.document.createElement('div');
    el.className = 'typejs-' + 'caret';
    container.appendChild(el);
    return el;
  };


}).call(Caret.prototype);








Caret.prototype.moveLeft = function () {
  if (this.offset <= 0) {
    return this;
  }
  this.offset -= 1;
  var rect = this._getRectForCharacter(this.textNode, this.offset);
  //this.positionByOffset(); // todo trigger by event
  var x = this.offset === 0 ? rect.left : rect.right;
  this.moveTo(x, rect.top);
  this.resetBlink();
  return this;
};

Caret.prototype.moveRight = function () {
  if (this.offset + 1 >= this.textNode.length) {
    return this;
  }
  var rect = this._getRectForCharacter(this.textNode, this.offset);
  this.offset += 1;
  //this.positionByOffset(); // todo trigger by event
  this.moveTo(rect.right, rect.top);
  this.resetBlink();
  return this;
};

Caret.prototype.moveUp = function () {
  var searched,
    current = this._getRectForCharacter(this.textNode, this.offset),
    charOffset = this.offset;
  do {
    searched = this._getRectForCharacter(this.textNode, charOffset);
    charOffset--;
    if(charOffset < 0) {
      return this;
    }
  } while (searched.top === current.top || searched.right > current.right)
  this.offset = charOffset;
  this.moveTo(searched.right, searched.top);
  this.resetBlink();
  return this;
};

Caret.prototype.moveDown = function () {
  var searched,
    current = this._getRectForCharacter(this.textNode, this.offset),
    charOffset = this.offset;
  do {
    searched = this._getRectForCharacter(this.textNode, charOffset);
    charOffset++;
    if(charOffset >= this.textNode.length) {
      return this;
    }
  } while (searched.top === current.top || searched.right < current.right)
  this.offset = charOffset;
  this.moveTo(searched.right, searched.top);
  this.resetBlink();
  return this;
};

Caret.prototype.insertAtOffset = function (value) {
  var str = this.textNode.nodeValue;
  if (this.offset > 0) {
    this.textNode.nodeValue = str.substring(0, this.offset) + value + str.substring(this.offset, str.length);
  } else {
    this.textNode.nodeValue = value + str;
  }
  this.moveRight();
};

Caret.prototype.removeAtOffset = function () {
  var offset = this.offset,
    str = this.textNode.nodeValue;
  this.moveLeft();
  this.moveLeft();
  if (offset > 0) {
    this.textNode.nodeValue = str.substring(0, offset - 1) + str.substring(offset, str.length);
  }
  this.moveRight();
};

/**
 * Moves the caret to the given position
 * @param x
 * @param y
 */
Caret.prototype.moveTo = function (x, y) {
  this.caretEl.style.left = x + 'px';
  this.caretEl.style.top = y + 'px';
};

/**
 * Makes the caret blink
 */
Caret.prototype.blink = function () {
  removeClass(this.caretEl, 'hide');
  addClass(this.caretEl, 'blink');
};

Caret.prototype.resetBlink = function () {
  var newCaret = this.caretEl.cloneNode(true);
  this.caretEl.parentNode.replaceChild(newCaret, this.caretEl);
  this.caretEl = newCaret;
};

/**
 * Removes the caret from the dom
 */
Caret.prototype.destroy = function () {
  var container = getElementContainer();
  container.removeChild(this.caretEl);
  if (!container.hasChildNodes()) {
    container.parentNode.removeChild(container);
  }
};

/**
 * Module exports
 * @type {Caret}
 */
module.exports = Caret;
