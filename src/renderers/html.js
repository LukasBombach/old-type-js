'use strict';

/**
 * Returns a DOM node reflecting a {DocumentNode}.
 * Will recursively generate and return nested nodes.
 * @private
 * @param node {DocumentNode}
 * @returns {*}
 */
function renderNode(node) {
  return node;
}

/**
 *
 * @param document {Document}
 * @constructor
 */
function HtmlRenderer(document) {
  this.document = document;
}

/**
 * Returns the DOM reflecting the internal document
 * @returns {*}
 */
HtmlRenderer.prototype.output = function () {
  return renderNode(this.document);
};

/**
 *
 * @type {HtmlRenderer}
 */
module.exports = HtmlRenderer;
