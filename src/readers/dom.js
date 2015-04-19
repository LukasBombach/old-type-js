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
  11 : 'DOCUMENT_FRAGMENT'
};

function getDocumentNodesForDomNode(domNode, parentDocumentNode) {

  var type = nodeTypeMap[domNode.nodeType];
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
