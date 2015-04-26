'use strict';

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

Caret.prototype.moveRight = function () {
  getCharacterWidth(this.textNode, this.offset);
  this.offset += 1;
  //this.positionByOffset(); // todo trigger by event
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
