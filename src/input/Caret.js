'use strict';

/**
 *
 * @type {Type|exports|module.exports}
 */
var Type = require('../core');

/**
 *
 * @type {string}
 */
var containerId = Type.settings.prefix + 'caret-container';

/**
 *
 * @returns {HTMLElement}
 */
function getElementContainer() {
  var container = window.document.getElementById(containerId);
  if (container === null) {
    container = window.document.createElement('div');
    container.setAttribute('id', containerId);
    window.document.appendChild(container);
  }
  return container;
}

/**
 *
 * @returns {HTMLElement}
 */
function createElement() {
  var container = getElementContainer(),
    el = window.document.createElement('div');
  el.className = Type.settings.prefix + 'caret';
  container.appendChild(el);
  return el;
}

/**
 *
 * @constructor
 */
function Caret() {
  this.el = createElement();
}

/**
 *
 * @type {Caret}
 */
module.exports = Caret;
