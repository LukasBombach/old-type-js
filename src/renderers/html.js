'use strict';

var DocumentNode = require('../document_node');

/**
 * Returns a DOM node reflecting a {DocumentNode}.
 * Will recursively generate and return nested nodes.
 * @private
 * @param node {DocumentNode}
 * @returns {*}
 */
function renderNode(node) {

  if (node.type === DocumentNode.TYPE.TEXT) {
    return node.value;
  }

  if (node.type === DocumentNode.TYPE.ELEMENT) {
    for (var i = 0; i < node.childNodes.length; i++) {
      documentNode.childNodes.push(getDocumentNodesForDomNode(domNode.childNodes[i], documentNode));
    }
  }

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
