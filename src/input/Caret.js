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
 * Creates a div - the visual representation of the caret
 * @private
 * @returns {HTMLElement}
 */
function createElement() {
  var container = getElementContainer(),
    el = window.document.createElement('div');
  el.className = 'typejs-' + 'caret';
  container.appendChild(el);
  return el;
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
 * The Caret function-object on which we work on
 * @constructor
 */
function Caret() {
  this.caretEl = createElement();
  this.hide();
}

/**
 *
 * @param textNode
 * @param offset
 * @returns {Caret}
 */
Caret.prototype.setTextNode = function (textNode, offset) {
  if (!(textNode instanceof Node) || textNode.nodeType !== Node.TEXT_NODE) {
    throw new Error('textNode parameter must be a Node of type Node.TEXT_NODE');
  }
  if (textNode === this.textNode && offset === null) {
    return this;
  }
  this.textNode = textNode;
  this.offset = offset || 0;
  // todo should trigger event that positions the caret visually
  return this;
};

function range(node, start, end, endNode) {
  var r = window.document.createRange();
  r.setEnd(endNode || node, end);
  r.setStart(node, start);
  return r;
}

function getRect(textNode, offset) {
  var rects = range(textNode, offset, offset + 1).getClientRects();
  return rects[0];
}

Caret.prototype.moveLeft = function () {
  if (this.offset - 1 < 0) {
    return this;
  }
  this.offset -= 1;
  var rect = getRect(this.textNode, this.offset);
  //this.positionByOffset(); // todo trigger by event
  this.moveTo(rect.right, rect.top);
  this.resetBlink();
  return this;
};

Caret.prototype.moveRight = function () {
  if (this.offset + 1 >= this.textNode.length) {
    return this;
  }
  var rect = getRect(this.textNode, this.offset);
  this.offset += 1;
  //this.positionByOffset(); // todo trigger by event
  this.moveTo(rect.right, rect.top);
  this.resetBlink();
  return this;
};

Caret.prototype.moveUp = function () {
  var searched,
    current = getRect(this.textNode, this.offset),
    charOffset = this.offset;
  do {
    searched = getRect(this.textNode, charOffset);
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
    current = getRect(this.textNode, this.offset),
    charOffset = this.offset;
  do {
    searched = getRect(this.textNode, charOffset);
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
 * Hides the caret
 */
Caret.prototype.hide = function () {
  removeClass(this.caretEl, 'blink');
  addClass(this.caretEl, 'hide');
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
