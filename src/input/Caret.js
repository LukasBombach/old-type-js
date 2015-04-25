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
  this.el = createElement();
  this.hide();
}

/**
 * Moves the caret to the given position
 * @param x
 * @param y
 */
Caret.prototype.moveTo = function (x, y) {
  this.el.style.left = x + 'px';
  this.el.style.top = y + 'px';
};

/**
 * Makes the caret blink
 */
Caret.prototype.blink = function () {
  removeClass(this.el, 'hide');
  addClass(this.el, 'blink');
};

/**
 * Hides the caret
 */
Caret.prototype.hide = function () {
  removeClass(this.el, 'blink');
  addClass(this.el, 'hide');
};

/**
 * Removes the caret from the dom
 */
Caret.prototype.destroy = function () {
  var container = getElementContainer();
  container.removeChild(this.el);
  if (!container.hasChildNodes()) {
    container.parentNode.removeChild(container);
  }
};

/**
 * Module exports
 * @type {Caret}
 */
module.exports = Caret;
