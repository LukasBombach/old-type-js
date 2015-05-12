'use strict';

var DocumentNode = require('../document_node');

var elementTypeMap = {
  TEXT   : 'text',
  BLOCK  : 'div',
  INLINE : 'span',
  IMG    : 'img',
  H1     : 'h1',
  H2     : 'h2',
  H3     : 'h3',
  H4     : 'h4',
  H5     : 'h5',
  H6     : 'h6',
  P      : 'p',
  STRONG : 'strong',
  EM     : 'em',
  A      : 'a',
  OL     : 'ol',
  UL     : 'ul',
  LI     : 'li',
  CODE   : 'code',
  PRE    : 'pre',
  SUP    : 'sup'
};

/**
 * Returns a DOM node reflecting a {DocumentNode}.
 * Will recursively generate and return nested nodes.
 * @private
 * @param node {DocumentNode}
 * @returns {*}
 */
function renderNode(node) {

  if (DocumentNode.ELTYPE[node.type] === DocumentNode.ELTYPE.TEXT) {
    return window.document.createTextNode(node.value);
  }

  var element = window.document.createElement(elementTypeMap[node.type]);

  for (var i = 0; i < node.childNodes.length; i++) {
    element.appendChild(renderNode(node.childNodes[i]));
  }

  return element;

}

/**
 *
 * @param document {TypeDocument}
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
  return renderNode(this.document.rootNode);
};

/**
 *
 * @type {HtmlRenderer}
 */
module.exports = HtmlRenderer;
