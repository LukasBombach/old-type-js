'use strict';

var DomReader = require('./readers/dom');
var Renderer = require('./renderers/html');

/**
 * The main class and entry point to set up a Type instance in the browser.
 *
 * @class Type
 **/

/**
 * Instantiates a new Type editor
 *
 * @constructor
 */
function Type(element, elementOut) {
  var reader = new DomReader(element);
  var document = reader.getDocument();
  var renderer = new Renderer(document);
  var output = renderer.output();
  elementOut.appendChild(output);
  /*window.setInterval(function () {
    var s = window.getSelection();
    var oRange = s.getRangeAt(0); //get the text range
    var oRect = oRange.getBoundingClientRect();
    console.log(oRect);
  }, 1000);*/
}

/**
 * Exposes Type's prototype as jQuery-style shorthand
 *
 * @type {Object}
 */
Type.fn = Type.prototype;

/**
 * Global Type settings.
 * Todo There should be an own settings module
 *
 * @type {{prefix: string}}
 */
Type.settings = {
  prefix : 'typejs-'
};

/**
 * @type {Type}
 */
module.exports = Type;
