'use strict';

var Document = require('../type_document');
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
  pre    : 'PRE',
  sup    : 'SUP'
};

/**
 *
 * @constructor
 */
function DomReader(rootNode) {
  this.setDom(rootNode);
}

/**
 *
 * @returns {TypeDocument}
 */
DomReader.prototype.getDocument = function () {
  this._load();
  return this.document;
};

DomReader.prototype.getMap = function () {
  this._load();
  console.log(this.map);
  return this.map;
};

DomReader.prototype._load = function () {
  if (this.dirty !== false) {
    this.map = {};
    this.document = new Document(this.getDocumentNodesForDomNode(this.dom, null));
    this.dirty = false;
  }
};

DomReader.prototype.getDocumentNodesForDomNode = function(domNode, parentDocumentNode) {

  var type, childNode;

  if (domNode.nodeType === NODE_TYPE_TEXT) {
    type = elementTypeMap.text;
  } else if(domNode.tagName === undefined) {
    type = 'UNKNOWN'; // Todo set constant not string
    console.debug('Skipping undefined tagName', domNode);
  } else if (elementTypeMap[domNode.tagName.toLowerCase()] !== undefined) {
    type = elementTypeMap[domNode.tagName.toLowerCase()];
  } else {
    type = 'UNKNOWN'; // Todo set constant not string
    console.debug('Did not find map for tag', domNode.tagName.toLowerCase());
  }

  var value = domNode.nodeType === Node.TEXT_NODE ? domNode.nodeValue : null;
  var documentNode = new DocumentNode(type, value, parentDocumentNode);

  for (var i = 0; i < domNode.childNodes.length; i++) {
    childNode = this.getDocumentNodesForDomNode(domNode.childNodes[i], documentNode);
    if(childNode.type !== 'UNKNOWN') { // Todo check against constant not string
      documentNode.childNodes.push(childNode);
    }
  }

  if(type != 'UNKNOWN') {
    this.map[domNode] = documentNode;
  }

  return documentNode;

};

/**
 *
 * @param rootNode
 * @returns {DomReader}
 */
DomReader.prototype.setDom = function (rootNode) {
  this.dom = rootNode;
  this.document = null;
  this.dirty = true;
  return this;
};

module.exports = DomReader;
