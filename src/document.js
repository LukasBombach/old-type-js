'use strict';

var Node = require('./document_node');

/**
 * Holds the contents of the editor
 *
 * @class Document
 * @constructor
 */
var Document = function (rootNode) {
  this.setRootNode(rootNode);
};

/**
 * Setter for rootNode
 * @param rootNode
 */
Document.prototype.setRootNode = function (rootNode) {
  this.rootNode = rootNode;
  return this;
};

module.exports = Document;
