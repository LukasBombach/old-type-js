'use strict';

var DomReader = require('./readers/dom');
var Renderer = require('./renderers/html');

/**
 * The main class and entry point to set up a Type instance in the browser.
 *
 * @class Type
 * @constructor
 */
function Type(element, elementOut) {
  var reader = new DomReader(element);
  var document = reader.getDocument();
  var renderer = new Renderer(document);
  var output = renderer.output();
  elementOut.appendChild(output);
  console.log(output);
}

Type.fn = Type.prototype;

module.exports = Type;
