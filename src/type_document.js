'use strict';

var Node = require('./document_node');

/**
 * Holds the contents of the editor
 *
 * @class TypeDocument
 * @constructor
 */
var TypeDocument = function (rootNode) {
  this.setRootNode(rootNode);
};

/**
 * Setter for rootNode
 * @param rootNode
 */
TypeDocument.prototype.setRootNode = function (rootNode) {
  this.rootNode = rootNode;
  return this;
};

module.exports = TypeDocument;
