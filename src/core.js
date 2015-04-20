'use strict';

var DomReader = require('./readers/dom');

/**
 * The main class and entry point to set up a Type instance in the browser.
 *
 * @class Type
 * @constructor
 */
function Type(element) {
  var reader = new DomReader(element);
  console.log(reader.getDocument());
}

Type.fn = Type.prototype;

module.exports = Type;
