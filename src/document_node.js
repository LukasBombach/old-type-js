'use strict';

/**
 * Creates a DocumentNode
 * @param type string A key in {DocumentNode.TYPE}
 * @param value
 * @constructor
 * @param parentNode
 */
function DocumentNode(type, value, parentNode) {
  if (type === null) {
    throw new Error('A type must be passed');
  }
  if (value instanceof DocumentNode) {
    parentNode = value;
    value = null;
  }
  this.setType(type);
  this.setValue(value);
  this.setParentNode(parentNode);
  this.childNodes = [];
}

/**
 * Setter for type
 * @param type string A key in {DocumentNode.TYPE}
 */
DocumentNode.prototype.setType = function (type) {
  if (!DocumentNode.TYPE.hasOwnProperty(type)) {
    throw new Error('The type passed must be a key of DocumentNode.TYPE');
  }
  this.type = type;
  return this;
};

/**
 * Setter for value
 * @param value
 */
DocumentNode.prototype.setValue = function (value) {
  this.value = value;
  return this;
};

/**
 * Setter for parentNode
 * @param parentNode
 */
DocumentNode.prototype.setParentNode = function (parentNode) {
  this.parentNode = parentNode;
  return this;
};

/**
 * Reflect DOM nodeTypes
 * @type {{
 *   ELEMENT: number,
 *   TEXT: number,
 *   PROCESSING_INSTRUCTION: number,
 *   COMMENT: number,
 *   DOCUMENT: number,
 *   DOCUMENT_TYPE: number,
 *   DOCUMENT_FRAGMENT: number
 * }}
 */
DocumentNode.TYPE = {
  ELEMENT : 1,
  TEXT : 3,
  PROCESSING_INSTRUCTION : 7,
  COMMENT : 8,
  DOCUMENT : 9,
  DOCUMENT_TYPE : 10,
  DOCUMENT_FRAGMENT : 11
};

/**
 * @type {DocumentNode}
 */
module.exports = DocumentNode;
