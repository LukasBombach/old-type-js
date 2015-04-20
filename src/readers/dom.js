'use strict';

var Document = require('../document');
var DocumentNode = require('../document_node');

var nodeTypeMap = {
  1  : 'ELEMENT',
  3  : 'TEXT',
  7  : 'PROCESSING_INSTRUCTION',
  8  : 'COMMENT',
  9  : 'DOCUMENT',
  10 : 'DOCUMENT_TYPE',
  11 : 'DOCUMENT_FRAGMENT',
};

var NODE_TYPE_TEXT = 3;

var elementTypeMap = {
  text   : 'TEXT',
  div    : 'BLOCK',
  span   : 'INLINE',
  img    : 'IMG',
  h1     : 'H1',
  h2     : 'H2',
  h3     : 'H3',
  h4     : 'H4',
  h5     : 'H5',
  h6     : 'H6',
  p      : 'P',
  strong : 'STRONG',
  bold   : 'STRONG',
  em     : 'EM',
  i      : 'EM',
  a      : 'A',
  ol     : 'OL',
  ul     : 'UL',
  li     : 'LI',
  code   : 'CODE',
  pre    : 'PRE'
};

function getDocumentNodesForDomNode(domNode, parentDocumentNode) {

  var type;

  if (domNode.nodeType === NODE_TYPE_TEXT) {
    type = elementTypeMap.text;
  } else if (elementTypeMap[domNode.tagName.toLowerCase()] !== undefined) {
    type = elementTypeMap[domNode.tagName.toLowerCase()];
  } else {
    type = 'UNKNOWN';
  }

  var value = domNode.nodeType === Node.TEXT_NODE ? domNode.nodeValue : null;
  var documentNode = new DocumentNode(type, value, parentDocumentNode);

  for (var i = 0; i < domNode.childNodes.length; i++) {
    documentNode.childNodes.push(getDocumentNodesForDomNode(domNode.childNodes[i], documentNode));
  }

  return documentNode;

}

/**
 *
 * @constructor
 */
function DomReader(rootNode) {
  this.setDom(rootNode);
}

/**
 *
 * @returns {Document}
 */
DomReader.prototype.getDocument = function () {
  if (this.documentDirty === false) {
    return this.document;
  }
  this.document = new Document(getDocumentNodesForDomNode(this.dom, null));
  this.documentDirty = false;
  return this.document;
};

/**
 *
 * @param rootNode
 * @returns {DomReader}
 */
DomReader.prototype.setDom = function (rootNode) {
  this.dom = rootNode;
  this.document = null;
  this.documentDirty = true;
  return this;
};

module.exports = DomReader;
