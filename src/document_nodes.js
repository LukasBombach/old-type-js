'use strict';

/**
 * Creates a DocumentNode
 * @param type string A key in {DocumentNode.TYPE}
 * @param value
 * @constructor
 */
function DocumentNode(type, value) {
  if (type === null) {
    throw new Error('A type must be passed');
  }
  this.setType(type);
  this.setValue(value);
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
